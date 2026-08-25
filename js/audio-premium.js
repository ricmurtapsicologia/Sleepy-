(()=>{
'use strict';
const C=window.SONO_CONTENT;
if(!C)return;

let player=null;
let synthActive=false;
let synthQueue=[];

const maleNames=/antonio|antônio|felipe|daniel|bruno|rafael|thiago|tiago|carlos|paulo|jo[aã]o|ricardo|marcelo|gustavo|lucas|mateus|matheus|eduardo|rodrigo|andre|andré|fabio|fábio|leonardo|henrique/i;
const naturalNames=/natural|neural|enhanced|premium|siri/i;
const trustedVendor=/microsoft|apple|samsung/i;
const roboticNames=/espeak|pico|compact|robot|standard/i;

function esc(v=''){return String(v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function currentView(){return document.querySelector('.view.active')?.dataset.view||'ferramentas'}
function showView(id){
  document.querySelectorAll('.view').forEach(v=>v.classList.toggle('active',v.dataset.view===id));
  document.querySelectorAll('.bottom-nav [data-nav]').forEach(b=>b.classList.toggle('active',b.dataset.nav===id));
  history.replaceState(null,'',`#${id}`);
  window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
}
function stopAll(){
  if(player){player.pause();player.src='';player=null}
  if('speechSynthesis'in window)speechSynthesis.cancel();
  synthActive=false;synthQueue=[];
}
function voiceScore(v){
  const name=(v.name||'').toLowerCase();
  const lang=(v.lang||'').toLowerCase();
  let score=0;
  if(lang==='pt-br'||lang==='pt_br')score+=100;
  else if(lang.startsWith('pt'))score+=45;
  else return -1000;
  if(maleNames.test(name))score+=90;
  if(naturalNames.test(name))score+=70;
  if(trustedVendor.test(name))score+=35;
  if(v.localService)score+=5;
  if(/google/i.test(name))score-=30;
  if(roboticNames.test(name))score-=80;
  return score;
}
function availableVoice(){
  if(!('speechSynthesis'in window))return null;
  return speechSynthesis.getVoices().filter(v=>/^pt/i.test(v.lang||'')).sort((a,b)=>voiceScore(b)-voiceScore(a))[0]||null;
}
function voiceIsPreferred(v){
  if(!v)return false;
  const name=v.name||'';
  return maleNames.test(name)&&(naturalNames.test(name)||trustedVendor.test(name))&&!/google/i.test(name);
}
function waitVoice(){
  return new Promise(resolve=>{
    const found=availableVoice();
    if(found){resolve(found);return}
    if(!('speechSynthesis'in window)){resolve(null);return}
    let done=false;
    const finish=()=>{if(done)return;done=true;resolve(availableVoice())};
    speechSynthesis.addEventListener?.('voiceschanged',finish,{once:true});
    setTimeout(finish,700);
  });
}
function chunks(text,max=320){
  const sentences=text.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map(s=>s.trim()).filter(Boolean)||[text];
  const out=[];let current='';
  for(const sentence of sentences){
    if(current&&(`${current} ${sentence}`).length>max){out.push(current);current=sentence}
    else current=current?`${current} ${sentence}`:sentence;
  }
  if(current)out.push(current);
  return out;
}
function updatePlay(symbol){const b=document.getElementById('premiumPlayBtn');if(b)b.textContent=symbol}
function speakNext(a,voice){
  if(!synthQueue.length){synthActive=false;updatePlay('▶');return}
  const u=new SpeechSynthesisUtterance(synthQueue.shift());
  u.lang='pt-BR';
  if(voice)u.voice=voice;
  u.rate=a.kind==='calm'?0.88:0.98;
  u.pitch=a.kind==='calm'?0.93:0.96;
  u.volume=0.94;
  u.onend=()=>{if(synthActive)setTimeout(()=>speakNext(a,voice),a.kind==='calm'?260:100)};
  u.onerror=()=>{synthActive=false;updatePlay('▶')};
  speechSynthesis.speak(u);
}
function startSpeech(a,voice){
  if(!('speechSynthesis'in window))return;
  speechSynthesis.cancel();
  synthQueue=chunks(a.script);
  synthActive=true;
  updatePlay('❚❚');
  speakNext(a,voice);
}
function fmt(sec){const m=Math.floor(sec/60),s=Math.floor(sec%60);return `${m}:${String(s).padStart(2,'0')}`}
function baseMarkup(a,back,note){
  return `<button class="back-link" type="button" data-nav="${esc(back)}">← Voltar</button>
  <div class="audio-stage">
    <div><span class="eyebrow">${esc(a.category)}</span><h1 id="audioTitle">${esc(a.title)}</h1><p>${a.kind==='calm'?'Use este áudio para diminuir um pouco a ativação, sem exigir que o sono aconteça.':'Uma explicação curta, em ritmo de conversa.'}</p></div>
    <div class="audio-controls"><button id="premiumPlayBtn" type="button" aria-label="Reproduzir ou pausar">▶</button><div><div class="audio-progress"><span id="audioProgressBar"></span></div></div><span class="audio-time" id="audioTime">${esc(a.duration)}</span></div>
  </div>${note}<details class="transcript"><summary>Ver transcrição</summary><p>${esc(a.script)}</p></details>`;
}
async function fileExists(src){
  try{const r=await fetch(src,{method:'HEAD',cache:'no-store'});return r.ok}catch{return false}
}
function playFile(a,src,back){
  const host=document.getElementById('audioExperience');
  host.innerHTML=baseMarkup(a,back,'<div class="audio-quality-note"><strong>Voz natural.</strong> Reprodução por arquivo de áudio produzido para a plataforma.</div>');
  player=new Audio(src);player.preload='metadata';
  document.getElementById('premiumPlayBtn')?.addEventListener('click',()=>{
    if(player.paused){player.play().then(()=>updatePlay('❚❚')).catch(()=>updatePlay('▶'))}
    else{player.pause();updatePlay('▶')}
  });
  player.addEventListener('timeupdate',()=>{
    const p=document.getElementById('audioProgressBar');
    if(p&&player.duration)p.style.width=`${Math.min(100,(player.currentTime/player.duration)*100)}%`;
    const t=document.getElementById('audioTime');
    if(t&&Number.isFinite(player.duration))t.textContent=`${fmt(player.currentTime)} / ${fmt(player.duration)}`;
  });
  player.addEventListener('ended',()=>updatePlay('▶'));
}
async function playSpeech(a,back){
  const voice=await waitVoice();
  const host=document.getElementById('audioExperience');
  const quality=voiceIsPreferred(voice);
  const note=voice
    ? `<div class="audio-quality-note"><strong>${quality?'Voz masculina preferencial':'Voz de compatibilidade do dispositivo'}.</strong> ${esc(voice.name)}. Arquivos masculinos naturais em /audio substituem automaticamente esta voz quando disponíveis.</div>`
    : '<div class="audio-unavailable"><strong>Este aparelho não disponibilizou uma voz em português.</strong> Use a transcrição enquanto o arquivo de áudio natural não estiver disponível.</div>';
  host.innerHTML=baseMarkup(a,back,note);
  const btn=document.getElementById('premiumPlayBtn');
  if(!voice){btn?.setAttribute('disabled','disabled');return}
  btn?.addEventListener('click',()=>{
    if(speechSynthesis.speaking&&!speechSynthesis.paused){speechSynthesis.pause();updatePlay('▶');return}
    if(speechSynthesis.paused){speechSynthesis.resume();updatePlay('❚❚');return}
    startSpeech(a,voice);
  });
}
async function openAudio(id){
  const a=C.audios[id];if(!a)return;
  const from=currentView();
  const back=from==='modulo'?'modulo':from==='inicio'?'inicio':'ferramentas';
  stopAll();showView('audio');
  const host=document.getElementById('audioExperience');
  host.innerHTML='<div class="audio-stage"><p>Preparando áudio…</p></div>';
  const src=a.src||`audio/${id}.mp3`;
  if(await fileExists(src))playFile(a,src,back);else await playSpeech(a,back);
}

document.addEventListener('click',event=>{
  const button=event.target.closest?.('[data-audio],[data-tool-audio]');
  if(!button)return;
  const id=button.dataset.audio||button.dataset.toolAudio;
  if(!id)return;
  event.preventDefault();
  event.stopImmediatePropagation();
  openAudio(id);
},true);

window.addEventListener('hashchange',()=>{if(location.hash!=='#audio')stopAll()});
})();

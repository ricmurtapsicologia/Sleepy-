(()=>{
'use strict';
const C=window.SONO_CONTENT;
if(!C)return;

let player=null;
let synthActive=false;
let synthPaused=false;
let synthQueue=[];
let currentId=null;

const badVoice=/google|espeak|pico|compact|android|robot|standard/i;
const premiumVoice=/natural|neural|enhanced|premium|siri/i;
const trustedVendor=/microsoft|apple|samsung/i;
const trustedNames=/francisca|antonio|antônio|luciana|felipe|thalita|thalia|camila|fernanda/i;

function esc(v=''){return String(v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function activeView(){return document.querySelector('.view.active')?.dataset.view||'ferramentas'}
function showView(id){
  document.querySelectorAll('.view').forEach(v=>v.classList.toggle('active',v.dataset.view===id));
  document.querySelectorAll('.bottom-nav [data-nav]').forEach(b=>b.classList.toggle('active',b.dataset.nav===id));
  history.replaceState(null,'',`#${id}`);
  window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
}
function stopAll(){
  if(player){player.pause();player.src='';player=null}
  if('speechSynthesis'in window)speechSynthesis.cancel();
  synthActive=false;synthPaused=false;synthQueue=[];currentId=null;
}

function scoreVoice(v){
  const name=(v.name||'').toLowerCase();
  const lang=(v.lang||'').toLowerCase();
  let s=0;
  if(lang==='pt-br'||lang==='pt_br')s+=45;else if(lang.startsWith('pt'))s+=25;else return -999;
  if(premiumVoice.test(name))s+=90;
  if(trustedVendor.test(name))s+=45;
  if(trustedNames.test(name))s+=35;
  if(v.localService)s+=5;
  if(badVoice.test(name))s-=140;
  return s;
}
function chooseNaturalVoice(){
  if(!('speechSynthesis'in window))return null;
  const ranked=speechSynthesis.getVoices().map(v=>({v,s:scoreVoice(v)})).sort((a,b)=>b.s-a.s);
  return ranked[0]&&ranked[0].s>=65?ranked[0].v:null;
}
function chooseAnyPtVoice(){
  if(!('speechSynthesis'in window))return null;
  return speechSynthesis.getVoices().filter(v=>/^pt/i.test(v.lang||'')).sort((a,b)=>scoreVoice(b)-scoreVoice(a))[0]||null;
}
function waitVoices(){
  return new Promise(resolve=>{
    const now=chooseNaturalVoice();if(now){resolve(now);return}
    if(!('speechSynthesis'in window)){resolve(null);return}
    let done=false;
    const finish=()=>{if(done)return;done=true;resolve(chooseNaturalVoice())};
    speechSynthesis.addEventListener?.('voiceschanged',finish,{once:true});
    setTimeout(finish,500);
  });
}
function speechChunks(text,max=360){
  const sentences=text.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map(s=>s.trim()).filter(Boolean)||[text];
  const out=[];let chunk='';
  for(const s of sentences){
    if(chunk&&(`${chunk} ${s}`).length>max){out.push(chunk);chunk=s}else chunk=chunk?`${chunk} ${s}`:s;
  }
  if(chunk)out.push(chunk);return out;
}
function speakQueue(a,voice,allowSynthetic=false){
  if(!synthQueue.length){synthActive=false;updatePlay('▶');return}
  const text=synthQueue.shift();
  const u=new SpeechSynthesisUtterance(text);
  u.lang='pt-BR';u.voice=voice;
  u.rate=a.kind==='calm'?0.86:0.96;
  u.pitch=a.kind==='calm'?0.98:1.0;
  u.volume=0.92;
  u.onend=()=>{if(synthActive)setTimeout(()=>speakQueue(a,voice,allowSynthetic),a.kind==='calm'?240:120)};
  u.onerror=()=>{synthActive=false;updatePlay('▶')};
  speechSynthesis.speak(u);
}
function startSpeech(a,voice){
  speechSynthesis.cancel();
  synthQueue=speechChunks(a.script);
  synthActive=true;synthPaused=false;updatePlay('❚❚');
  speakQueue(a,voice);
}
function updatePlay(txt){const b=document.getElementById('premiumPlayBtn');if(b)b.textContent=txt}

async function fileExists(src){
  try{const r=await fetch(src,{method:'HEAD',cache:'no-store'});return r.ok}catch{return false}
}
function renderFilePlayer(a,src,back){
  const host=document.getElementById('audioExperience');
  host.innerHTML=baseMarkup(a,back,`<div class="audio-quality-note"><strong>Áudio natural.</strong> Esta faixa usa um arquivo de voz produzido e padronizado, sem depender da voz sintética do navegador.</div>`);
  player=new Audio(src);player.preload='metadata';
  bindCustomPlayer(a,()=>{
    if(player.paused){player.play();updatePlay('❚❚')}else{player.pause();updatePlay('▶')}
  });
  player.addEventListener('timeupdate',()=>{
    const p=document.getElementById('audioProgressBar');if(p&&player.duration)p.style.width=`${Math.min(100,player.currentTime/player.duration*100)}%`;
    const t=document.getElementById('audioTime');if(t&&Number.isFinite(player.duration))t.textContent=`${fmt(player.currentTime)} / ${fmt(player.duration)}`;
  });
  player.addEventListener('ended',()=>updatePlay('▶'));
}
function fmt(sec){const m=Math.floor(sec/60),s=Math.floor(sec%60);return `${m}:${String(s).padStart(2,'0')}`}
function baseMarkup(a,back,note){
  return `<button class="back-link" type="button" data-nav="${esc(back)}">← Voltar</button><div class="audio-stage"><div><span class="eyebrow">${esc(a.category)}</span><h1 id="audioTitle">${esc(a.title)}</h1><p>${a.kind==='calm'?'Use este áudio para reduzir um pouco a ativação, sem exigir que o sono aconteça.':'Uma explicação curta, com linguagem direta e ritmo de conversa.'}</p></div><div><div class="audio-controls"><button id="premiumPlayBtn" type="button" aria-label="Reproduzir ou pausar">▶</button><div><div class="audio-progress"><span id="audioProgressBar"></span></div></div><span class="audio-time" id="audioTime">${esc(a.duration)}</span></div></div></div>${note}<details class="transcript"><summary>Ver transcrição</summary><p>${esc(a.script)}</p></details>`;
}
function bindCustomPlayer(a,onPlay){
  document.getElementById('premiumPlayBtn')?.addEventListener('click',onPlay);
}
async function renderSpeechPlayer(a,back){
  const voice=await waitVoices();
  const host=document.getElementById('audioExperience');
  if(voice){
    host.innerHTML=baseMarkup(a,back,`<div class="audio-quality-note"><strong>Voz natural do dispositivo:</strong> ${esc(voice.name)}. A plataforma rejeita vozes Google/robóticas quando não atingem o padrão mínimo de naturalidade.</div>`);
    bindCustomPlayer(a,()=>{
      if(speechSynthesis.speaking&&!speechSynthesis.paused){speechSynthesis.pause();synthPaused=true;updatePlay('▶');return}
      if(speechSynthesis.paused){speechSynthesis.resume();synthPaused=false;updatePlay('❚❚');return}
      startSpeech(a,voice);
    });
    return;
  }
  host.innerHTML=baseMarkup(a,back,`<div class="audio-unavailable"><strong>Voz natural não disponível neste aparelho.</strong><br>Para não reproduzir uma voz robótica, a plataforma não inicia automaticamente o sintetizador disponível. A transcrição permanece acessível. Quando os arquivos de voz premium forem adicionados em <code>/audio</code>, eles serão usados automaticamente.</div><details class="transcript"><summary>Opção de compatibilidade</summary><p>Se você aceitar uma voz sintética do próprio aparelho, use o botão abaixo. A qualidade pode variar.</p><button class="button ghost" type="button" id="allowDeviceVoice">Ouvir voz do aparelho</button></details>`);
  document.getElementById('premiumPlayBtn')?.setAttribute('disabled','disabled');
  document.getElementById('allowDeviceVoice')?.addEventListener('click',()=>{
    const any=chooseAnyPtVoice();if(!any)return;
    document.getElementById('premiumPlayBtn')?.removeAttribute('disabled');
    startSpeech(a,any);
  });
}
async function openNaturalAudio(id){
  const a=C.audios[id];if(!a)return;
  const back=activeView()==='modulo'?'modulo':activeView()==='inicio'?'inicio':'ferramentas';
  stopAll();currentId=id;showView('audio');
  const host=document.getElementById('audioExperience');
  host.innerHTML='<div class="audio-stage"><p>Preparando áudio…</p></div>';
  const src=a.src||`audio/${id}.mp3`;
  if(await fileExists(src))renderFilePlayer(a,src,back);else await renderSpeechPlayer(a,back);
}

document.addEventListener('click',e=>{
  const audio=e.target.closest?.('[data-audio]');
  const tool=e.target.closest?.('[data-tool-audio]');
  const id=audio?.dataset.audio||tool?.dataset.toolAudio;
  if(!id)return;
  e.preventDefault();e.stopImmediatePropagation();
  openNaturalAudio(id);
},true);

window.addEventListener('hashchange',()=>{if(location.hash!=='#audio')stopAll()});
})();
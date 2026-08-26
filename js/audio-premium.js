(()=>{
'use strict';
if(window.__SONO_AUDIO_PREMIUM__)return;
window.__SONO_AUDIO_PREMIUM__=true;
const C=window.SONO_CONTENT;
if(!C)return;

const PROGRESS_KEY='sonoEmDia.audioProgress.v1';
let player=null;
let activeId=null;
let persistTick=0;

function esc(v=''){return String(v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function loadProgress(){try{return JSON.parse(localStorage.getItem(PROGRESS_KEY)||'{}')||{}}catch{return{}}}
function saveProgress(map){try{localStorage.setItem(PROGRESS_KEY,JSON.stringify(map))}catch{}}
function currentView(){return document.querySelector('.view.active')?.dataset.view||'ferramentas'}
function showView(id){
  document.querySelectorAll('.view').forEach(v=>v.classList.toggle('active',v.dataset.view===id));
  document.querySelectorAll('.bottom-nav [data-nav]').forEach(b=>b.classList.toggle('active',b.dataset.nav===id));
  document.body.dataset.activeView=id;
  history.replaceState(null,'',`#${id}`);
  window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
}
function fmt(sec){
  if(!Number.isFinite(sec)||sec<0)return'0:00';
  const m=Math.floor(sec/60),s=Math.floor(sec%60);
  return `${m}:${String(s).padStart(2,'0')}`;
}
function setPlaySymbol(symbol){const b=document.getElementById('premiumPlayBtn');if(b)b.textContent=symbol}
function persist(){
  if(!player||!activeId||!Number.isFinite(player.currentTime))return;
  const map=loadProgress();
  map[activeId]=Math.max(0,Math.floor(player.currentTime));
  saveProgress(map);
}
function clearProgress(id){
  const map=loadProgress();
  delete map[id];
  saveProgress(map);
}
function stopAll(){
  if(player){
    persist();
    player.pause();
    player.removeAttribute('src');
    try{player.load()}catch{}
  }
  player=null;
  activeId=null;
  persistTick=0;
}
function markup(a,back){
  return `<button class="back-link" type="button" data-nav="${esc(back)}">← Voltar</button>
  <div class="audio-stage">
    <div>
      <span class="eyebrow">${esc(a.category)}</span>
      <h1 id="audioTitle">${esc(a.title)}</h1>
      <p>${a.kind==='calm'?'Use como apoio para reduzir a ativação, sem exigir que o sono aconteça.':'Uma explicação curta, em ritmo de conversa.'}</p>
    </div>
    <div class="audio-controls">
      <button id="premiumPlayBtn" type="button" aria-label="Reproduzir ou pausar" disabled>▶</button>
      <div class="audio-progress" id="audioSeek" role="slider" aria-label="Progresso do áudio" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" tabindex="0"><span id="audioProgressBar"></span></div>
      <span class="audio-time" id="audioTime">Preparando…</span>
    </div>
  </div>
  <div class="audio-quality-note" id="audioStatus"><strong>Áudio produzido para o Sono em Dia.</strong> Reprodução por arquivo, sem usar a voz do aparelho.</div>
  <details class="transcript"><summary>Ver transcrição</summary><p>${esc(a.script)}</p></details>`;
}
function unavailable(a){
  const status=document.getElementById('audioStatus');
  const time=document.getElementById('audioTime');
  const btn=document.getElementById('premiumPlayBtn');
  if(status)status.innerHTML='<strong>Áudio temporariamente indisponível.</strong> A transcrição permanece disponível abaixo.';
  if(time)time.textContent=a.duration||'—';
  if(btn){btn.disabled=true;btn.textContent='▶'}
}
function seekTo(event){
  if(!player||!Number.isFinite(player.duration)||!player.duration)return;
  const seek=document.getElementById('audioSeek');
  if(!seek)return;
  const r=seek.getBoundingClientRect();
  const ratio=Math.max(0,Math.min(1,(event.clientX-r.left)/r.width));
  player.currentTime=ratio*player.duration;
}
function updateUi(){
  if(!player)return;
  const duration=player.duration;
  const ratio=Number.isFinite(duration)&&duration>0?Math.min(1,player.currentTime/duration):0;
  const bar=document.getElementById('audioProgressBar');
  const time=document.getElementById('audioTime');
  const seek=document.getElementById('audioSeek');
  if(bar)bar.style.width=`${ratio*100}%`;
  if(time)time.textContent=Number.isFinite(duration)?`${fmt(player.currentTime)} / ${fmt(duration)}`:fmt(player.currentTime);
  if(seek)seek.setAttribute('aria-valuenow',String(Math.round(ratio*100)));
  persistTick++;
  if(persistTick%8===0)persist();
}
function wirePlayer(a,id,src){
  player=new Audio(src);
  activeId=id;
  player.preload='metadata';
  const btn=document.getElementById('premiumPlayBtn');
  const seek=document.getElementById('audioSeek');
  player.addEventListener('loadedmetadata',()=>{
    const saved=Number(loadProgress()[id]||0);
    if(saved>0&&Number.isFinite(player.duration)&&saved<player.duration-10)player.currentTime=saved;
    if(btn)btn.disabled=false;
    updateUi();
  });
  player.addEventListener('canplay',()=>{if(btn)btn.disabled=false},{once:true});
  player.addEventListener('timeupdate',updateUi);
  player.addEventListener('play',()=>setPlaySymbol('❚❚'));
  player.addEventListener('pause',()=>setPlaySymbol('▶'));
  player.addEventListener('ended',()=>{clearProgress(id);setPlaySymbol('▶');updateUi()});
  player.addEventListener('error',()=>unavailable(a));
  btn?.addEventListener('click',async()=>{
    if(!player)return;
    if(player.paused){
      try{await player.play()}catch{unavailable(a)}
    }else player.pause();
  });
  seek?.addEventListener('click',seekTo);
  seek?.addEventListener('keydown',e=>{
    if(!player||!Number.isFinite(player.duration))return;
    if(e.key==='ArrowRight'){e.preventDefault();player.currentTime=Math.min(player.duration,player.currentTime+10)}
    if(e.key==='ArrowLeft'){e.preventDefault();player.currentTime=Math.max(0,player.currentTime-10)}
  });
  player.load();
}
function openAudio(id){
  const a=C.audios[id];if(!a)return;
  const from=currentView();
  const back=from==='modulo'?'modulo':from==='inicio'?'inicio':'ferramentas';
  stopAll();
  showView('audio');
  const host=document.getElementById('audioExperience');
  if(!host)return;
  host.innerHTML=markup(a,back);
  const src=a.src||`audio/${id}.mp3?v=ampulheta-n2`;
  wirePlayer(a,id,src);
}

document.addEventListener('click',event=>{
  const button=event.target.closest?.('[data-audio],[data-tool-audio]');
  if(!button)return;
  const id=button.dataset.audio||button.dataset.toolAudio;
  if(!id||!C.audios[id])return;
  event.preventDefault();
  event.stopImmediatePropagation();
  openAudio(id);
},true);

window.addEventListener('pagehide',persist);
window.addEventListener('hashchange',()=>{if(location.hash!=='#audio')stopAll()});
window.SONO_AUDIO={open:openAudio,stop:stopAll};
})();
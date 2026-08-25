(()=>{
'use strict';
const APP_KEY='sonoEmDia.v1';

function readState(){
  try{return JSON.parse(localStorage.getItem(APP_KEY)||'{}')||{}}catch{return{}}
}

function hasProgress(state){
  return Boolean(
    state.assessmentDone ||
    (Array.isArray(state.diary)&&state.diary.length) ||
    (Array.isArray(state.completedModules)&&state.completedModules.length) ||
    (state.plan&&Object.keys(state.plan).length)
  );
}

function injectCriticalStyle(){
  if(document.getElementById('cognitiveCritical'))return;
  const style=document.createElement('style');
  style.id='cognitiveCritical';
  style.textContent=`
    body[data-experience="new"] #inicio .hero-panel,
    body[data-experience="new"] #inicio .principles,
    body[data-experience="new"] #howToUse,
    body[data-experience="new"] .bottom-nav,
    body[data-experience="new"] #shareBtn,
    body[data-experience="new"] .footer{display:none!important}
    body[data-experience="returning"] #inicio .hero,
    body[data-experience="returning"] #inicio .principles,
    body[data-experience="returning"] #howToUse{display:none!important}
  `;
  document.head.appendChild(style);
}

function ensureCognitiveCss(){
  if(document.querySelector('link[href*="cognitive.css"]'))return;
  const link=document.createElement('link');
  link.rel='stylesheet';
  link.href='css/cognitive.css?v=20260825-3';
  document.head.appendChild(link);
}

function ensureEntryAudio(){
  if(document.getElementById('entryAudio'))return;
  const copy=document.querySelector('#inicio .hero-copy');
  if(!copy)return;
  const box=document.createElement('div');
  box.className='entry-audio';
  box.id='entryAudio';
  box.innerHTML='<div class="entry-audio-copy"><strong>Prefere ouvir?</strong><span>Apresentação curta • 1–2 min</span></div><button class="audio-button" type="button" data-audio="welcome" aria-label="Ouvir apresentação do Sono em Dia">▶</button>';
  copy.appendChild(box);
}

function ensureLandingBranding(){
  if(document.getElementById('landingBranding'))return;
  const hero=document.querySelector('#inicio .hero');
  if(!hero)return;
  const footer=document.createElement('footer');
  footer.id='landingBranding';
  footer.className='landing-branding shell';
  footer.setAttribute('aria-label','Branding profissional');
  footer.innerHTML=`
    <div class="landing-brand-lockup">
      <span class="landing-brand-mark" aria-hidden="true">◌</span>
      <div><strong>Sono em Dia</strong><small>ciência • rotina • cuidado</small></div>
    </div>
    <div class="landing-professional">
      <strong>Richelmy Murta</strong>
      <span>Psicólogo Clínico • Especialista em Terapia Cognitivo-Comportamental</span>
    </div>
  `;
  hero.insertAdjacentElement('afterend',footer);
}

function simplifyFirstVisit(){
  const eyebrow=document.querySelector('#inicio .hero-copy > .eyebrow');
  const title=document.getElementById('homeTitle');
  const lead=document.querySelector('#inicio .hero-lead');
  const start=document.getElementById('startJourneyBtn');
  const cont=document.getElementById('continueJourneyBtn');
  const privacy=document.querySelector('#inicio .hero-copy > .privacy-note');
  if(eyebrow&&eyebrow.textContent!=='COMECE POR AQUI')eyebrow.textContent='COMECE POR AQUI';
  if(title&&title.textContent!=='Como está o seu sono?')title.textContent='Como está o seu sono?';
  if(lead&&lead.textContent!=='Em poucos passos, organize seu padrão e descubra por onde começar.')lead.textContent='Em poucos passos, organize seu padrão e descubra por onde começar.';
  if(start&&start.textContent!=='Entender meu sono')start.textContent='Entender meu sono';
  if(cont){cont.dataset.empty='true';cont.hidden=true}
  if(privacy&&privacy.textContent!=='Leva poucos minutos • seus dados ficam neste aparelho.')privacy.textContent='Leva poucos minutos • seus dados ficam neste aparelho.';
  ensureEntryAudio();
  ensureLandingBranding();
}

function todayISO(){
  const d=new Date();
  const local=new Date(d.getTime()-d.getTimezoneOffset()*60000);
  return local.toISOString().slice(0,10);
}

function simplifyReturningHome(state){
  const dash=document.getElementById('homeDashboard');
  if(!dash)return;
  dash.hidden=false;
  const cards=[...dash.children];
  cards.forEach(c=>{delete c.dataset.nextAction;delete c.dataset.supportingFocus});
  const registeredToday=(state.diary||[]).some(x=>x&&x.date===todayISO());
  const primary=registeredToday?(cards[2]||cards[0]):cards[0];
  const focus=cards[1];
  if(primary)primary.dataset.nextAction='true';
  if(focus)focus.dataset.supportingFocus='true';
}

function activeView(){return document.querySelector('.view.active')?.dataset.view||'inicio'}

function applyExperience(){
  const state=readState();
  const returning=hasProgress(state);
  document.body.dataset.experience=returning?'returning':'new';
  document.body.dataset.activeView=activeView();
  const how=document.getElementById('howToUse');
  if(how)how.hidden=true;
  const landing=document.getElementById('landingBranding');
  if(landing)landing.hidden=returning;
  if(returning)simplifyReturningHome(state);else simplifyFirstVisit();
}

function goHome(e){
  const brand=e.target.closest?.('.brand');
  if(!brand)return;
  e.preventDefault();
  const target=document.querySelector('[data-view="inicio"]');
  if(!target)return;
  document.querySelectorAll('.view').forEach(v=>v.classList.toggle('active',v===target));
  document.querySelectorAll('.bottom-nav [data-nav]').forEach(b=>b.classList.toggle('active',b.dataset.nav==='inicio'));
  history.replaceState(null,'','#inicio');
  applyExperience();
  window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
}

injectCriticalStyle();

document.addEventListener('click',goHome,true);
document.addEventListener('click',()=>setTimeout(applyExperience,0));
document.addEventListener('submit',()=>setTimeout(applyExperience,0));
window.addEventListener('hashchange',()=>setTimeout(applyExperience,0));
window.addEventListener('storage',applyExperience);
window.addEventListener('pageshow',applyExperience);

function boot(){
  ensureCognitiveCss();
  applyExperience();
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
else boot();
})();
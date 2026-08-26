(()=>{
'use strict';
const C=window.SONO_CONTENT;
const KEY='sonoEmDia.v1';
const initial={assessment:{},assessmentDone:false,assessmentIndex:0,diary:[],completedModules:[],reflections:{},plan:{},theme:'auto',lastModule:1};
let state=loadState();
let currentView='inicio';
let currentModule=1;
let activeAudio=null;
let audioTimer=null;
let audioStart=0;
let audioElapsed=0;
let utteranceQueue=[];

function loadState(){try{return {...initial,...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch(e){return {...initial}}}
function saveState(){localStorage.setItem(KEY,JSON.stringify(state))}
function $(s,root=document){return root.querySelector(s)}
function $$(s,root=document){return [...root.querySelectorAll(s)]}
function esc(v=''){return String(v).replace(/[&<>'"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[m]))}
function toast(msg){const el=$('#toast');el.textContent=msg;el.classList.add('show');clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove('show'),2200)}

function nav(view,push=true){
  if(!document.querySelector(`[data-view="${view}"]`))view='inicio';
  currentView=view;
  $$('.view').forEach(v=>v.classList.toggle('active',v.dataset.view===view));
  $$('.bottom-nav [data-nav]').forEach(b=>b.classList.toggle('active',b.dataset.nav===view));
  if(push)history.replaceState(null,'',`#${view}`);
  window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
  if(view==='inicio')renderHome();
  if(view==='jornada')renderModules();
  if(view==='meu-sono')renderProgress(Number($('.period-tabs .active')?.dataset.days||7));
  if(view==='mapa')renderMap();
  if(view==='plano')loadPlanForm();
}

function initNav(){
  document.addEventListener('click',e=>{const b=e.target.closest('[data-nav]');if(!b)return;nav(b.dataset.nav)});
  const hash=location.hash.replace('#','');if(hash&&document.querySelector(`[data-view="${hash}"]`))nav(hash,false);
  else nav('inicio',false);
}

function renderHome(){
  const dash=$('#homeDashboard');dash.hidden=!state.assessmentDone;
  $('#todayDate').textContent=new Intl.DateTimeFormat('pt-BR',{day:'2-digit',month:'short'}).format(new Date());
  const focus=getFocusItems();
  $('#dailyFocusTitle').textContent=focus[0]?.title||'Regularidade antes de perfeição';
  $('#dailyFocusText').textContent=focus[0]?.text||'Observe seu horário de levantar e procure consistência antes de tentar controlar a hora exata em que o sono chega.';
  const next=C.modules.find(m=>!state.completedModules.includes(m.id))||C.modules[7];
  $('#nextModuleTitle').textContent=`${next.id}. ${next.title}`;
  $('#nextModuleMeta').textContent=next.meta;
}

function initStart(){
  $('#startJourneyBtn').addEventListener('click',()=>{state.assessmentIndex=state.assessmentDone?0:state.assessmentIndex||0;saveState();renderAssessment();nav(state.assessmentDone?'mapa':'avaliacao')});
  $('#continueJourneyBtn').addEventListener('click',()=>nav(state.assessmentDone?'jornada':'avaliacao'));
}

function renderAssessment(){
  const idx=Math.max(0,Math.min(C.assessment.length-1,state.assessmentIndex||0));state.assessmentIndex=idx;
  const q=C.assessment[idx];
  $('#assessmentProgress').style.width=`${((idx+1)/C.assessment.length)*100}%`;
  const selected=state.assessment[q.id]||'';
  $('#assessmentStep').innerHTML=`<span class="eyebrow">${idx+1} DE ${C.assessment.length}</span><h2>${esc(q.title)}</h2>${q.subtitle?`<p>${esc(q.subtitle)}</p>`:''}<div class="choice-list">${q.options.map(([v,l])=>`<label class="choice"><input type="radio" name="assessmentChoice" value="${esc(v)}" ${selected===v?'checked':''}><span>${esc(l)}</span></label>`).join('')}</div>`;
  $('#assessmentBack').disabled=idx===0;
  $('#assessmentNext').textContent=idx===C.assessment.length-1?'Ver meu mapa':'Continuar';
}

function initAssessment(){
  $('#assessmentBack').addEventListener('click',()=>{if(state.assessmentIndex>0){state.assessmentIndex--;saveState();renderAssessment()}});
  $('#assessmentNext').addEventListener('click',()=>{
    const checked=$('input[name="assessmentChoice"]:checked');
    if(!checked){toast('Escolha uma opção para continuar.');return}
    const q=C.assessment[state.assessmentIndex];state.assessment[q.id]=checked.value;
    if(state.assessmentIndex<C.assessment.length-1){state.assessmentIndex++;saveState();renderAssessment();return}
    state.assessmentDone=true;saveState();renderHome();nav('mapa');
  });
}

function getFocusItems(){
  const a=state.assessment||{};const items=[];
  if(['variable','veryVariable'].includes(a.regularity))items.push({title:'Torne o despertar mais previsível',text:'Comece observando o horário de levantar. Regularidade costuma ser um alvo mais útil do que perseguir uma hora perfeita para adormecer.'});
  if(a.worry==='high')items.push({title:'Reduza a luta com o sono',text:'Quando o sono vira tarefa, o monitoramento pode aumentar ativação. Seu próximo foco é diminuir urgência e controle.'});
  if(['sometimes','yes'].includes(a.lateCaffeine))items.push({title:'Teste o horário da cafeína',text:'Em vez de proibir, faça um experimento: antecipe a última cafeína e observe seu padrão por alguns dias.'});
  if(['often'].includes(a.sleepOnset)||['many'].includes(a.awakenings))items.push({title:'Observe cama, vigília e compensações',text:'Registre o que acontece depois de uma noite difícil e como você reage quando percebe que está acordado.'});
  if(['frequent'].includes(a.naps))items.push({title:'Observe o papel dos cochilos',text:'Veja se os cochilos estão ajudando no funcionamento ou alterando a pressão de sono no fim do dia.'});
  if(!items.length)items.push({title:'Construa consistência sem rigidez',text:'Seu ponto de partida é observar horários, funcionamento e hábitos por alguns dias antes de mudar muitas coisas ao mesmo tempo.'});
  return items.slice(0,3);
}

function renderMap(){
  const a=state.assessment||{};
  const rows=[
    ['Regularidade','Quanto seus horários variam',a.regularity==='regular'?'Boa':a.regularity==='variable'?'Pode melhorar':a.regularity==='veryVariable'?'Irregular':'Ainda não informado'],
    ['Início do sono','Facilidade para adormecer',a.sleepOnset==='easy'?'Pouca dificuldade':a.sleepOnset==='sometimes'?'Variável':a.sleepOnset==='often'?'Dificuldade frequente':'Ainda não informado'],
    ['Despertares','Continuidade percebida',a.awakenings==='few'?'Poucos':a.awakenings==='some'?'Alguns':a.awakenings==='many'?'Frequentes/longos':'Ainda não informado'],
    ['Preocupação','Quanto o sono ocupa sua atenção',a.worry==='low'?'Baixa':a.worry==='moderate'?'Moderada':a.worry==='high'?'Elevada':'Ainda não informado'],
    ['Impacto diurno','Repercussão no funcionamento',a.daytime==='low'?'Baixo':a.daytime==='moderate'?'Moderado':a.daytime==='high'?'Elevado':'Ainda não informado']
  ];
  $('#sleepMap').innerHTML=rows.map(r=>`<div class="map-row"><div><strong>${r[0]}</strong><small>${r[1]}</small></div><span class="map-value">${r[2]}</span></div>`).join('');
  $('#focusList').innerHTML=getFocusItems().map(x=>`<li><strong>${esc(x.title)}</strong><br><span>${esc(x.text)}</span></li>`).join('');
  $('#professionalAlert').hidden=!(a.breathing==='yes'||a.sleepiness==='yes'||a.daytime==='high'||a.shift==='yes');
}

function renderModules(){
  $('#moduleGrid').innerHTML=C.modules.map(m=>`<article class="module-card ${state.completedModules.includes(m.id)?'done':''}"><span class="module-number">MÓDULO ${String(m.id).padStart(2,'0')}</span><span class="module-status">${state.completedModules.includes(m.id)?'Concluído ✓':'Em aberto'}</span><h3>${esc(m.title)}</h3><p>${esc(m.summary)}</p><div class="module-meta">${esc(m.meta)}</div><button class="text-button" type="button" data-open-module="${m.id}">${state.completedModules.includes(m.id)?'Revisar':'Abrir módulo'} →</button></article>`).join('');
  $$('[data-open-module]').forEach(b=>b.addEventListener('click',()=>openModule(Number(b.dataset.openModule))));
}

function openModule(id){
  currentModule=id;state.lastModule=id;saveState();const m=C.modules.find(x=>x.id===id);if(!m)return;
  const reflection=state.reflections[id]||'';
  $('#moduleContent').innerHTML=`<button class="back-link" type="button" data-nav="jornada">← Jornada</button><span class="eyebrow">MÓDULO ${String(id).padStart(2,'0')}</span><h1 id="moduleTitle">${esc(m.title)}</h1><p class="section-lead">${esc(m.summary)}</p>
  <section class="module-section"><span class="eyebrow">ENTENDA</span><p>${esc(m.understand)}</p></section>
  <section class="module-section"><span class="eyebrow">OUÇA</span>${audioCardMarkup(m.audio,true)}</section>
  <section class="module-section"><span class="eyebrow">EXPERIMENTE</span><div class="takeaway">${esc(m.experiment)}</div></section>
  <section class="module-section"><span class="eyebrow">OBSERVE</span><div class="reflection-box"><strong>${esc(m.observe)}</strong><textarea id="moduleReflection" rows="4" placeholder="Escreva apenas se for útil para você.">${esc(reflection)}</textarea></div></section>
  <section class="module-section"><span class="eyebrow">LEVE PARA HOJE</span><div class="takeaway">${esc(m.takeaway)}</div></section>
  <div class="stack-actions"><button class="button primary" id="completeModuleBtn" type="button">${state.completedModules.includes(id)?'Módulo concluído ✓':'Concluir módulo'}</button><button class="button ghost" type="button" data-nav="jornada">Voltar à jornada</button></div>`;
  $('#moduleReflection').addEventListener('input',e=>{state.reflections[id]=e.target.value;saveState()});
  $('#completeModuleBtn').addEventListener('click',()=>{if(!state.completedModules.includes(id))state.completedModules.push(id);saveState();renderHome();toast('Módulo concluído.');$('#completeModuleBtn').textContent='Módulo concluído ✓'});
  bindAudioButtons($('#moduleContent'));nav('modulo');
}

function audioCardMarkup(id,large=false){const a=C.audios[id];return `<div class="audio-card"><div><strong>${esc(a.title)}</strong><small>${esc(a.category)} • ${esc(a.duration)}</small></div><button type="button" data-audio="${id}" aria-label="Ouvir ${esc(a.title)}">▶</button></div>`}

function initDiary(){
  $$('.segmented').forEach(group=>{group.innerHTML=['Muito baixa','Baixa','Média','Boa','Muito boa'].map((l,i)=>`<button type="button" data-value="${i+1}">${l}</button>`).join('');group.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;$$('button',group).forEach(x=>x.classList.remove('selected'));b.classList.add('selected');group.nextElementSibling.value=b.dataset.value})});
  $('#sleepDiaryForm').addEventListener('submit',e=>{e.preventDefault();const f=new FormData(e.currentTarget);if(!f.get('quality')||!f.get('energy')){toast('Informe qualidade e energia para salvar.');return}
    const entry={id:Date.now(),date:new Date().toISOString().slice(0,10),bedTime:f.get('bedTime'),trySleepTime:f.get('trySleepTime'),sleepLatency:+f.get('sleepLatency'),awakenings:+f.get('awakenings'),waso:+f.get('waso'),wakeTime:f.get('wakeTime'),riseTime:f.get('riseTime'),quality:+f.get('quality'),energy:+f.get('energy'),lateCaffeine:f.get('lateCaffeine'),nap:f.get('nap'),note:f.get('note')||''};
    Object.assign(entry,calculateDiaryMetrics(entry));state.diary=state.diary.filter(x=>x.date!==entry.date);state.diary.push(entry);state.diary.sort((a,b)=>a.date.localeCompare(b.date));saveState();e.currentTarget.reset();$$('.segmented button').forEach(b=>b.classList.remove('selected'));$('#diarySaved').hidden=false;setTimeout(()=>$('#diarySaved').hidden=true,3000);toast('Registro salvo neste dispositivo.');renderHome();
  });
}
function mins(t){if(!t)return null;const [h,m]=t.split(':').map(Number);return h*60+m}
function duration(a,b){let d=mins(b)-mins(a);if(d<0)d+=1440;return d}
function calculateDiaryMetrics(e){const tib=duration(e.bedTime,e.riseTime);const latency=Math.max(0,e.sleepLatency||0);const waso=Math.max(0,e.waso||0);const tst=Math.max(0,tib-latency-waso);const efficiency=tib?Math.round((tst/tib)*100):0;return {timeInBed:tib,totalSleep:tst,efficiency,riseMinutes:mins(e.riseTime)}}

function renderProgress(days=7){
  const cutoff=new Date();cutoff.setDate(cutoff.getDate()-(days-1));const c=cutoff.toISOString().slice(0,10);const list=state.diary.filter(x=>x.date>=c);const avg=k=>list.length?Math.round(list.reduce((s,x)=>s+(+x[k]||0),0)/list.length):0;
  const variability=list.length>1?Math.round(Math.sqrt(list.reduce((s,x)=>s+Math.pow((x.riseMinutes||0)-avg('riseMinutes'),2),0)/list.length)):0;
  const metrics=[['Registros',list.length?String(list.length):'—','dias registrados'],['Sono estimado',list.length?fmtMins(avg('totalSleep')):'—','média aproximada'],['Tempo acordado',list.length?`${avg('waso')} min`:'—','durante a noite'],['Regularidade',list.length>1?regularityLabel(variability):'—','horário de levantar']];
  $('#metricsGrid').innerHTML=metrics.map(m=>`<div class="metric"><span>${m[0]}</span><strong>${m[1]}</strong><small>${m[2]}</small></div>`).join('');
  $('#periodInsight').textContent=progressInsight(list,variability);
  renderRiseChart(list.slice(-12));
}
function fmtMins(v){if(!v)return'—';return `${Math.floor(v/60)}h ${String(v%60).padStart(2,'0')}min`}
function regularityLabel(sd){return sd<=30?'Mais estável':sd<=60?'Variável':'Bem variável'}
function progressInsight(list,sd){if(list.length<3)return'Faça pelo menos três registros para que possamos mostrar tendências sem dar peso excessivo a uma única noite.';if(sd<=30)return'Seus horários de levantar estão relativamente próximos neste período. Continue observando sem transformar regularidade em rigidez.';if(sd<=60)return'Seu horário de levantar variou de forma moderada. Vale observar se a variação acompanha finais de semana, plantões ou compensações depois de noites ruins.';return'Seu horário de levantar variou bastante. Antes de tentar mudar muitas coisas, observe o que está puxando esses horários para extremos diferentes.'}
function renderRiseChart(list){const el=$('#riseChart');if(!list.length){el.innerHTML='<p class="section-lead">Ainda não há registros suficientes para este gráfico.</p>';return}const values=list.map(x=>x.riseMinutes||0);const min=Math.min(...values),max=Math.max(...values),range=Math.max(60,max-min);el.innerHTML=list.map(x=>{const h=30+((x.riseMinutes-min)/range)*95;return `<div class="bar-wrap" title="${esc(x.date)} • ${esc(x.riseTime)}"><div class="bar" style="height:${h}px"></div><span class="bar-label">${esc(x.riseTime)}</span></div>`}).join('')}
function initProgress(){
  $$('.period-tabs button').forEach(b=>b.addEventListener('click',()=>{$$('.period-tabs button').forEach(x=>x.classList.remove('active'));b.classList.add('active');renderProgress(Number(b.dataset.days))}));
  $('#openPlanBtn').addEventListener('click',()=>nav('plano'));
  $('#clearDataBtn').addEventListener('click',()=>{if(confirm('Apagar todos os registros, progresso, respostas e plano salvos neste dispositivo?')){localStorage.removeItem(KEY);state={...initial};renderHome();renderProgress();toast('Dados locais apagados.');nav('inicio')}});
}

function initPlan(){
  $('#sleepPlanForm').addEventListener('submit',e=>{e.preventDefault();state.plan=Object.fromEntries(new FormData(e.currentTarget).entries());saveState();toast('Seu plano foi salvo neste dispositivo.')});
  $('#printPlanBtn').addEventListener('click',()=>window.print());
}
function loadPlanForm(){const f=$('#sleepPlanForm');Object.entries(state.plan||{}).forEach(([k,v])=>{if(f.elements[k])f.elements[k].value=v})}

function renderTools(){
  $('#toolGrid').innerHTML=C.tools.map(t=>`<button class="tool-card" type="button" data-tool-audio="${t.audio}"><strong>${esc(t.title)}</strong><span>${esc(t.desc)}</span></button>`).join('');
  $('#audioLibrary').innerHTML=Object.entries(C.audios).filter(([id])=>id!=='welcome').map(([id,a])=>audioCardMarkup(id)).join('');
  $$('[data-tool-audio]').forEach(b=>b.addEventListener('click',()=>openAudio(b.dataset.toolAudio)));
  bindAudioButtons($('#audioLibrary'));
}

function bindAudioButtons(root=document){
  $$('[data-audio]',root).forEach(b=>{b.onclick=()=>openAudio(b.dataset.audio)})
}
function openAudio(id){
  if(window.SONO_AUDIO?.open)return window.SONO_AUDIO.open(id);
  toast('Áudio temporariamente indisponível. Use a transcrição.');
}
function stopAudio(){window.SONO_AUDIO?.stop?.()}

function initTheme(){
  document.documentElement.dataset.theme=state.theme||'auto';
  $('#themeBtn').addEventListener('click',()=>{const cur=document.documentElement.dataset.theme;const next=cur==='auto'?'dark':cur==='dark'?'light':'auto';document.documentElement.dataset.theme=next;state.theme=next;saveState();toast(next==='dark'?'Modo noturno':next==='light'?'Modo claro':'Tema automático')});
}

async function share(){const data={title:'Sono em Dia',text:'Entenda seu sono. Cuide melhor das suas noites.',url:location.origin+location.pathname};try{if(navigator.share)await navigator.share(data);else{await navigator.clipboard.writeText(data.url);toast('Link copiado.')}}catch(e){if(e.name!=='AbortError')toast('Não foi possível compartilhar agora.')}}
function initShare(){$('#shareBtn').addEventListener('click',share);$('#footerShareBtn').addEventListener('click',share)}

function initPWA(){if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}))}

function boot(){
  initTheme();initNav();initStart();initAssessment();initDiary();initProgress();initPlan();initShare();renderTools();renderAssessment();renderHome();renderModules();bindAudioButtons();initPWA();
}
document.addEventListener('DOMContentLoaded',boot);
})();

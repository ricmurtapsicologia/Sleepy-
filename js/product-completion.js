(()=>{
'use strict';
const C=window.SONO_CONTENT;
if(!C)return;

const APP_KEY='sonoEmDia.v1';
const UX_KEY='sonoEmDia.ux.v1';
const HABIT_KEY='sonoEmDia.habit.v1';

function load(key,fallback={}){try{return JSON.parse(localStorage.getItem(key)||'null')||fallback}catch{return fallback}}
function save(key,value){try{localStorage.setItem(key,JSON.stringify(value))}catch{}}
function appState(){return load(APP_KEY,{assessment:{},diary:[],plan:{}})}
function esc(v=''){return String(v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function avg(list,key){if(!list.length)return null;return list.reduce((s,x)=>s+(Number(x[key])||0),0)/list.length}

// Completa a triagem sem transformar a plataforma em instrumento diagnóstico.
const extraQuestions=[
  {id:'parasomnia',title:'Durante o sono, alguém já observou comportamentos que pareceram incomuns ou perigosos?',subtitle:'Por exemplo: levantar e caminhar sem perceber, agir de forma intensa durante sonhos ou se machucar durante o sono.',type:'single',options:[['no','Não'],['unsure','Não sei'],['sometimes','Já aconteceu alguma vez'],['yes','Acontece ou aconteceu repetidamente'],['skip','Prefiro não responder']]},
  {id:'sleepNeedChange',title:'Recentemente houve períodos em que você dormiu muito menos que o habitual e, mesmo assim, ficou com energia incomumente alta?',subtitle:'Considere mudanças claras em relação ao seu padrão habitual, não apenas uma noite curta isolada.',type:'single',options:[['no','Não'],['unsure','Não tenho certeza'],['yes','Sim'],['skip','Prefiro não responder']]},
  {id:'distress',title:'A dificuldade com o sono tem vindo acompanhada de sofrimento emocional difícil de manejar sozinho?',subtitle:'Por exemplo: ansiedade ou tristeza muito intensas, sensação de descontrole ou prejuízo importante no dia a dia.',type:'single',options:[['low','Não ou pouco'],['moderate','Em alguns momentos'],['high','Sim, de forma importante'],['skip','Prefiro não responder']]}
];
for(const q of extraQuestions){if(!C.assessment.some(x=>x.id===q.id))C.assessment.push(q)}

const habits=[
  {id:'light',title:'Luz',text:'Observe se você recebe luz natural pela manhã e muita luz intensa à noite.',experiment:'Por 5 dias, procure receber luz natural no início do dia e observe se seu horário de sonolência muda.'},
  {id:'regularity',title:'Regularidade',text:'Horários muito variáveis podem dificultar a previsibilidade do sistema de sono.',experiment:'Escolha um horário de levantar realista e tente mantê-lo dentro de uma faixa de aproximadamente 1 hora por 5 dias.'},
  {id:'caffeine',title:'Cafeína',text:'A sensibilidade e o tempo de eliminação variam entre pessoas.',experiment:'Antecipe sua última dose de cafeína por alguns dias e compare como fica o início do sono.'},
  {id:'alcohol',title:'Álcool',text:'Pode facilitar sonolência inicial e, ao mesmo tempo, fragmentar o sono mais tarde.',experiment:'Observe por alguns dias se noites com e sem álcool diferem em despertares e sensação de descanso.'},
  {id:'movement',title:'Movimento',text:'Atividade física regular pode favorecer sono e funcionamento diurno.',experiment:'Inclua movimento em horário confortável durante o dia e observe energia e sono sem transformar isso em obrigação noturna.'},
  {id:'screens',title:'Telas e ativação',text:'O problema nem sempre é a tela em si; conteúdo, trabalho e excitação mental também importam.',experiment:'Na última hora antes de deitar, troque uma atividade muito estimulante por outra de menor ativação e observe o efeito.'},
  {id:'naps',title:'Cochilos',text:'Cochilos podem ajudar em alguns contextos e reduzir pressão de sono em outros.',experiment:'Registre horário e duração dos cochilos por alguns dias antes de decidir se precisa mudá-los.'},
  {id:'environment',title:'Ambiente',text:'Temperatura, ruído, luminosidade e conforto podem interferir de formas diferentes.',experiment:'Escolha apenas um fator do ambiente para ajustar nesta semana e observe se houve diferença.'}
];

function ensureHowTo(){
  if(document.getElementById('howToUse'))return;
  const ux=load(UX_KEY,{});
  const hero=document.querySelector('#inicio .hero');
  if(!hero)return;
  const section=document.createElement('section');
  section.id='howToUse';
  section.className='shell how-to';
  section.hidden=!!ux.howToDismissed;
  section.innerHTML=`<div class="how-to-head"><div><span class="eyebrow">COMO USAR</span><h2>Quatro passos. Sem precisar aprender o aplicativo.</h2></div><button class="text-button" id="dismissHowTo" type="button">Entendi</button></div><div class="how-to-grid"><article><b>1</b><strong>Faça seu mapa</strong><span>Responda perguntas rápidas para organizar o ponto de partida.</span></article><article><b>2</b><strong>Registre suas noites</strong><span>Leva cerca de um minuto e serve para enxergar tendências.</span></article><article><b>3</b><strong>Avance pela jornada</strong><span>Leia, ouça e experimente uma mudança de cada vez.</span></article><article><b>4</b><strong>Use quando precisar</strong><span>Ferramentas rápidas ficam disponíveis para noites difíceis.</span></article></div>`;
  hero.insertAdjacentElement('afterend',section);
  section.querySelector('#dismissHowTo')?.addEventListener('click',()=>{section.hidden=true;save(UX_KEY,{...ux,howToDismissed:true})});
}

function ensureHabits(){
  if(document.getElementById('habitLab'))return;
  const tools=document.querySelector('#ferramentas .tool-grid');
  if(!tools)return;
  const section=document.createElement('section');
  section.id='habitLab';
  section.className='habit-lab';
  section.innerHTML=`<div class="section-divider"></div><div class="section-heading"><div><span class="eyebrow">HÁBITOS E SONO</span><h2>Escolha um experimento por vez.</h2></div><p>Não são regras universais. Selecione o fator que parece mais relevante para você e observe o que acontece.</p></div><div class="habit-grid">${habits.map(h=>`<button type="button" class="habit-card" data-habit="${h.id}"><strong>${h.title}</strong><span>${h.text}</span></button>`).join('')}</div><article class="habit-experiment" id="habitExperiment" hidden></article>`;
  tools.insertAdjacentElement('afterend',section);
  const selected=load(HABIT_KEY,{}).id;
  if(selected)showHabit(selected,section);
  section.addEventListener('click',e=>{const b=e.target.closest('[data-habit]');if(!b)return;showHabit(b.dataset.habit,section)});
}
function showHabit(id,root=document){
  const h=habits.find(x=>x.id===id);if(!h)return;
  save(HABIT_KEY,{id,chosenAt:new Date().toISOString()});
  root.querySelectorAll?.('[data-habit]').forEach(b=>b.classList.toggle('selected',b.dataset.habit===id));
  const box=root.querySelector?.('#habitExperiment')||document.getElementById('habitExperiment');
  if(!box)return;box.hidden=false;
  box.innerHTML=`<span class="eyebrow">SEU EXPERIMENTO</span><h3>${esc(h.title)}</h3><p>${esc(h.experiment)}</p><small>Teste como observação, não como obrigação. Depois, use o diário para comparar tendências.</small>`;
}

function ensurePlanFields(){
  const form=document.getElementById('sleepPlanForm');if(!form||form.dataset.complete==='1')return;
  form.dataset.complete='1';
  const submit=form.querySelector('button[type="submit"]');
  const html=`<label>Como quero lidar com cochilos<textarea name="napPlan" rows="2" placeholder="Ex.: observar necessidade, horário e duração antes de mudar."></textarea></label><label>Meu ambiente de sono<textarea name="environmentPlan" rows="2" placeholder="Luz, ruído, temperatura, conforto ou outro fator relevante."></textarea></label><label>Os fatores que mais interferem no meu sono<textarea name="mainInterference" rows="3" placeholder="Ex.: preocupação, plantões, cafeína tardia, despertares, irregularidade..."></textarea></label><label>Depois de uma noite ruim, no dia seguinte quero…<textarea name="dayAfterPlan" rows="3" placeholder="Defina uma resposta realista, evitando compensações exageradas."></textarea></label><label>Sinais de que preciso procurar ajuda profissional<textarea name="warningSigns" rows="3" placeholder="Ex.: sonolência perigosa, ronco/pausas respiratórias, sofrimento intenso ou piora persistente."></textarea></label><label>Se eu precisar de ajuda, meu próximo passo será…<textarea name="helpPlan" rows="3" placeholder="Ex.: conversar com meu psicólogo, médico ou serviço de saúde."></textarea></label>`;
  submit?.insertAdjacentHTML('beforebegin',html);
  const plan=appState().plan||{};
  Object.entries(plan).forEach(([k,v])=>{if(form.elements[k]&&v!=null)form.elements[k].value=v});
}

function extraMapRows(){
  const a=appState().assessment||{};
  return [
    ['Despertar precoce','Acordar antes do desejado',a.earlyWake==='yes'?'Frequente':a.earlyWake==='sometimes'?'Às vezes':a.earlyWake==='no'?'Pouco frequente':null],
    ['Ativação antes de dormir','Trabalho, telas ou conteúdo estimulante',a.screenUse==='high'?'Frequente':a.screenUse==='moderate'?'Algumas noites':a.screenUse==='low'?'Baixa':null],
    ['Cafeína tardia','Uso após 16h',a.lateCaffeine==='yes'?'Frequente':a.lateCaffeine==='sometimes'?'Alguns dias':a.lateCaffeine==='no'?'Raro':null],
    ['Segurança respiratória','Ronco, pausas ou engasgos',a.breathing==='yes'?'Merece avaliação':a.breathing==='unsure'?'Não está claro':a.breathing==='no'?'Sem sinal informado':null]
  ].filter(x=>x[2]);
}
function enhanceMap(){
  const map=document.getElementById('sleepMap');if(!map)return;
  map.querySelectorAll('.map-extra').forEach(x=>x.remove());
  for(const r of extraMapRows()){
    const el=document.createElement('div');el.className='map-row map-extra';
    el.innerHTML=`<div><strong>${esc(r[0])}</strong><small>${esc(r[1])}</small></div><span class="map-value">${esc(r[2])}</span>`;map.appendChild(el);
  }
  const a=appState().assessment||{};
  const alert=document.getElementById('professionalAlert');
  const flags=[a.breathing==='yes',a.sleepiness==='yes',a.parasomnia==='yes',a.sleepNeedChange==='yes',a.distress==='high',a.medication==='self'];
  if(alert&&flags.some(Boolean)){
    alert.hidden=false;
    alert.innerHTML='<strong>Vale conversar com um profissional.</strong><p>Alguns sinais informados merecem avaliação individual para que a orientação seja segura e específica para você. Não altere medicamentos por conta própria.</p>';
  }
  const list=document.getElementById('focusList');if(list){
    const existing=[...list.querySelectorAll('li strong')].map(x=>x.textContent);
    const additions=[];
    if(a.screenUse==='high')additions.push(['Crie uma transição para a noite','Reduza atividades muito estimulantes na última parte da noite e observe o efeito.']);
    if(a.alcohol==='yes')additions.push(['Observe o papel do álcool','Compare despertares e descanso em noites com e sem álcool, sem usá-lo como indutor do sono.']);
    if(a.medication==='self')additions.push(['Revise o uso de substâncias ou medicações','Converse com um profissional antes de manter ou alterar algo usado para dormir.']);
    for(const [t,p] of additions){if(list.children.length>=3)break;if(existing.includes(t))continue;list.insertAdjacentHTML('beforeend',`<li><strong>${esc(t)}</strong><br><span>${esc(p)}</span></li>`)}
  }
}

function enhanceProgress(){
  const grid=document.getElementById('metricsGrid');if(!grid)return;
  grid.querySelectorAll('[data-extra-metric]').forEach(x=>x.remove());
  const state=appState();
  const days=Number(document.querySelector('.period-tabs .active')?.dataset.days||7);
  const cutoff=new Date();cutoff.setDate(cutoff.getDate()-(days-1));const c=cutoff.toISOString().slice(0,10);
  const list=(state.diary||[]).filter(x=>x.date>=c);if(!list.length)return;
  const vals=[
    ['Qualidade',avg(list,'quality')?.toFixed(1)+'/5','percepção média'],
    ['Energia',avg(list,'energy')?.toFixed(1)+'/5','pela manhã'],
    ['Despertares',avg(list,'awakenings')?.toFixed(1),'média por noite']
  ];
  for(const [label,value,small] of vals){grid.insertAdjacentHTML('beforeend',`<div class="metric" data-extra-metric="1"><span>${label}</span><strong>${value}</strong><small>${small}</small></div>`)}
  let extras=document.getElementById('trendExtras');
  if(!extras){
    extras=document.createElement('article');extras.id='trendExtras';extras.className='card trend-extras';
    document.querySelector('.insight-card')?.insertAdjacentElement('afterend',extras);
  }
  const q=avg(list,'quality'),e=avg(list,'energy'),w=avg(list,'waso');
  extras.innerHTML=`<span class="eyebrow">OUTRAS TENDÊNCIAS</span><div class="trend-lines"><div><span>Qualidade percebida</span><progress max="5" value="${q||0}"></progress></div><div><span>Energia pela manhã</span><progress max="5" value="${e||0}"></progress></div><div><span>Tempo acordado à noite</span><strong>${Math.round(w||0)} min</strong></div></div>`;
}

function ensureSafety(){
  const about=document.querySelector('#sobre .prose');if(!about||document.getElementById('safetyGuide'))return;
  const card=document.createElement('section');card.id='safetyGuide';card.className='safety-guide';
  card.innerHTML='<h2>Quando não é apenas uma questão de rotina</h2><p>Procure avaliação profissional se houver ronco intenso com pausas respiratórias, engasgos, sonolência ao dirigir, comportamentos incomuns ou perigosos durante o sono, mudanças marcantes na necessidade de dormir, uso de substâncias/medicação sem acompanhamento ou sofrimento emocional importante.</p><p><strong>Se houver risco imediato à sua segurança ou à de outra pessoa, procure atendimento de emergência.</strong></p>';
  about.appendChild(card);
}

function accessibilityPolish(){
  const progress=document.querySelector('#assessmentProgress')?.parentElement;
  if(progress){progress.setAttribute('role','progressbar');progress.setAttribute('aria-label','Progresso da avaliação')}
  document.querySelectorAll('.bottom-nav button').forEach(b=>{if(b.classList.contains('active'))b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')});
  document.querySelectorAll('button').forEach(b=>{if(!b.getAttribute('aria-label')&&!b.textContent.trim())b.setAttribute('aria-label','Ação')});
}

function activeEnhancements(){
  const active=document.querySelector('.view.active')?.dataset.view;
  if(active==='mapa')setTimeout(enhanceMap,0);
  if(active==='meu-sono')setTimeout(enhanceProgress,0);
  accessibilityPolish();
}

function boot(){
  ensureHowTo();ensureHabits();ensurePlanFields();ensureSafety();activeEnhancements();
  document.addEventListener('click',e=>{
    if(e.target.closest('.period-tabs button'))setTimeout(enhanceProgress,30);
    if(e.target.closest('[data-nav]'))setTimeout(activeEnhancements,30);
  });
  const obs=new MutationObserver(()=>activeEnhancements());
  document.querySelectorAll('.view').forEach(v=>obs.observe(v,{attributes:true,attributeFilter:['class']}));
}

document.addEventListener('DOMContentLoaded',boot);
})();

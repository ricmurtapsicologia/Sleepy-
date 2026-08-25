(()=>{
'use strict';
const C=window.SONO_CONTENT;
if(!C)return;

C.assessment=[
  {id:'sleepOnset',title:'Na maioria das noites, quanto tempo você leva para adormecer depois que decide tentar dormir?',subtitle:'Não precisa cronometrar. Escolha a opção que mais se aproxima do seu padrão.',type:'single',options:[['easy','Geralmente até cerca de 30 minutos'],['sometimes','Frequentemente entre 30 e 60 minutos'],['often','Frequentemente mais de 60 minutos ou varia muito'],['skip','Prefiro não responder']]},
  {id:'awakenings',title:'Depois que adormece, você costuma acordar durante a noite e permanecer desperto?',subtitle:'Pense nos despertares que você realmente percebe e que interrompem seu descanso.',type:'single',options:[['few','Raramente, ou acordo por pouco tempo'],['some','Algumas noites tenho despertares mais demorados'],['many','Isso acontece com frequência ou por períodos longos'],['skip','Prefiro não responder']]},
  {id:'earlyWake',title:'Você costuma acordar mais cedo do que gostaria e não conseguir voltar a dormir?',type:'single',options:[['no','Raramente'],['sometimes','Algumas vezes'],['yes','Com frequência'],['skip','Prefiro não responder']]},
  {id:'regularity',title:'De um dia para outro, quanto mudam seus horários de deitar e de levantar?',subtitle:'Considere dias de trabalho e dias livres.',type:'single',options:[['regular','Normalmente variam menos de 1 hora'],['variable','Costumam variar entre 1 e 2 horas'],['veryVariable','Frequentemente variam mais de 2 horas'],['skip','Prefiro não responder']]},
  {id:'daytime',title:'Durante o dia, o sono tem atrapalhado seu funcionamento?',subtitle:'Por exemplo: energia, atenção, memória, humor, trabalho ou estudos.',type:'single',options:[['low','Pouco ou nada'],['moderate','Percebo algum prejuízo'],['high','O prejuízo é importante ou frequente'],['skip','Prefiro não responder']]},
  {id:'worry',title:'Quando vai dormir, quanto você fica preocupado com a possibilidade de não conseguir dormir?',type:'single',options:[['low','Pouco ou nada'],['moderate','Às vezes essa preocupação aparece'],['high','A preocupação é frequente e fico tentando controlar o sono'],['skip','Prefiro não responder']]},
  {id:'lateCaffeine',title:'Você costuma consumir cafeína depois das 16h?',subtitle:'Inclua café, energéticos, pré-treinos, chá preto/mate e refrigerantes com cafeína.',type:'single',options:[['no','Raramente ou nunca'],['sometimes','Alguns dias'],['yes','Na maioria dos dias'],['skip','Prefiro não responder']]},
  {id:'naps',title:'Você costuma cochilar durante o dia?',type:'single',options:[['none','Raramente ou nunca'],['short','Às vezes, geralmente por pouco tempo'],['frequent','Com frequência ou por períodos longos'],['skip','Prefiro não responder']]},
  {id:'screenUse',title:'Na última hora antes de deitar, você costuma continuar em atividades que deixam sua mente muito ativa?',subtitle:'Por exemplo: trabalho, redes sociais, jogos, discussões ou vídeos muito estimulantes.',type:'single',options:[['low','Raramente'],['moderate','Algumas noites'],['high','Na maioria das noites'],['skip','Prefiro não responder']]},
  {id:'alcohol',title:'Você costuma usar bebida alcoólica perto do horário de dormir para relaxar ou pegar no sono?',type:'single',options:[['no','Raramente ou nunca'],['sometimes','Às vezes'],['yes','Com frequência'],['skip','Prefiro não responder']]},
  {id:'breathing',title:'Alguém já percebeu ronco muito alto, pausas na sua respiração, engasgos ou sensação de sufocamento enquanto você dorme?',type:'single',options:[['no','Não'],['unsure','Não sei ou durmo sozinho'],['yes','Sim'],['skip','Prefiro não responder']]},
  {id:'sleepiness',title:'Você já cochilou ou quase adormeceu dirigindo ou durante outra atividade em que isso seria perigoso?',type:'single',options:[['no','Não'],['unsure','Não tenho certeza'],['yes','Sim'],['skip','Prefiro não responder']]},
  {id:'shift',title:'Seu trabalho, plantão ou rotina obriga você a mudar bastante os horários de dormir?',type:'single',options:[['no','Não'],['sometimes','Às vezes'],['yes','Sim, isso acontece com frequência'],['skip','Prefiro não responder']]},
  {id:'medication',title:'Você usa algum medicamento ou substância com a intenção de ajudar a dormir?',subtitle:'Esta pergunta serve apenas para organizar o contexto. Não altere medicações por conta própria.',type:'single',options:[['no','Não'],['prescribed','Sim, com orientação profissional'],['self','Sim, por conta própria ou sem acompanhamento atual'],['skip','Prefiro não responder']]}
];

const clearerObserve={
  1:'Seu horário de levantar costuma ser parecido na maioria dos dias ou muda bastante depois de uma noite ruim?',
  2:'Depois de dormir mal, o que você costuma mudar no dia seguinte para tentar compensar?',
  3:'Qual comportamento você começou a fazer depois que seu sono piorou e ainda mantém hoje?',
  4:'Quando percebe que está acordado na cama, qual é a primeira coisa que você costuma fazer?',
  5:'Depois de uma noite ruim, você costuma aumentar muito o tempo que passa na cama?',
  6:'Qual pensamento aparece primeiro quando você percebe que ainda não dormiu?',
  7:'Você consegue usar uma técnica de relaxamento sem ficar verificando se ela já está fazendo você dormir?',
  8:'Depois de uma noite ruim, qual comportamento de compensação você gostaria de reduzir primeiro?'
};
C.modules.forEach(m=>{if(clearerObserve[m.id])m.observe=clearerObserve[m.id]});
})();
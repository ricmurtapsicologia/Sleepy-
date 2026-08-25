const fs=require('fs');
const vm=require('vm');
const path=require('path');

const source=fs.readFileSync(path.join(process.cwd(),'js/content.js'),'utf8');

// content.js contém uma pequena inicialização de browser após os dados.
// O exportador precisa apenas de window.SONO_CONTENT; estes stubs impedem
// que código de apresentação quebre a execução no Node.
const inertNode=()=>({
  rel:'',href:'',src:'',defer:false,
  setAttribute(){},
  appendChild(){},
  addEventListener(){}
});
const context={
  window:{},
  document:{
    createElement:inertNode,
    head:{appendChild(){}},
    body:{appendChild(){}},
    querySelector(){return null},
    querySelectorAll(){return[]}
  },
  console
};

vm.createContext(context);
vm.runInContext(source,context,{filename:'js/content.js'});

const audios=context.window.SONO_CONTENT?.audios||{};
const out={};
for(const [id,a] of Object.entries(audios)){
  if(!a?.script)continue;
  out[id]={
    title:a.title,
    category:a.category,
    kind:a.kind||'explain',
    script:String(a.script).trim()
  };
}

if(!Object.keys(out).length)throw new Error('Nenhum roteiro de áudio foi exportado.');
fs.writeFileSync(process.argv[2]||'/tmp/sono-audios.json',JSON.stringify(out,null,2),'utf8');
console.log(`Exportados ${Object.keys(out).length} roteiros de áudio.`);
const CACHE='sono-em-dia-v6';
const ASSETS=['./','./index.html','./css/styles.css','./css/refinements.css','./css/product-completion.css','./css/cognitive.css','./js/content.js','./js/app.js','./js/product-completion.js','./js/audio-premium.js','./js/nav-fix.js','./assets/favicon.svg','./assets/social-preview.svg','./manifest.webmanifest'];

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)));
    await self.clients.claim();
    const clients=await self.clients.matchAll({type:'window'});
    for(const client of clients){try{await client.navigate(client.url)}catch{}}
  })());
});

function patchHtml(html){
  if(!html.includes('css/refinements.css'))html=html.replace('</head>','  <link rel="stylesheet" href="css/refinements.css">\n</head>');
  if(!html.includes('css/product-completion.css'))html=html.replace('</head>','  <link rel="stylesheet" href="css/product-completion.css">\n</head>');
  if(!html.includes('css/cognitive.css'))html=html.replace('</head>','  <link rel="stylesheet" href="css/cognitive.css">\n</head>');
  if(!html.includes('js/product-completion.js'))html=html.replace('</body>','  <script src="js/product-completion.js"></script>\n</body>');
  if(!html.includes('js/audio-premium.js'))html=html.replace('</body>','  <script src="js/audio-premium.js"></script>\n</body>');
  if(!html.includes('js/nav-fix.js'))html=html.replace('</body>','  <script src="js/nav-fix.js"></script>\n</body>');
  return html;
}

async function htmlResponse(request){
  let response;
  try{
    response=await fetch(request,{cache:'no-store'});
    if(response.ok){const cache=await caches.open(CACHE);cache.put(request,response.clone())}
  }catch{response=await caches.match(request)||await caches.match('./index.html')}
  if(!response)return new Response('Offline',{status:503});
  const text=await response.text();
  return new Response(patchHtml(text),{status:response.status,statusText:response.statusText,headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-cache'}});
}

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(url.origin!==location.origin)return;
  if(event.request.mode==='navigate'||url.pathname.endsWith('/index.html')||url.pathname.endsWith('/')){event.respondWith(htmlResponse(event.request));return}
  event.respondWith(fetch(event.request,{cache:'no-store'}).then(response=>{const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));return response}).catch(()=>caches.match(event.request)));
});
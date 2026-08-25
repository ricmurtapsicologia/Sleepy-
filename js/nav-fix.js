(()=>{
'use strict';
function goHome(e){
  const brand=e.target.closest?.('.brand');
  if(!brand)return;
  e.preventDefault();
  const target=document.querySelector('[data-view="inicio"]');
  if(!target)return;
  document.querySelectorAll('.view').forEach(v=>v.classList.toggle('active',v===target));
  document.querySelectorAll('.bottom-nav [data-nav]').forEach(b=>b.classList.toggle('active',b.dataset.nav==='inicio'));
  history.replaceState(null,'','#inicio');
  window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
}
document.addEventListener('click',goHome,true);
})();

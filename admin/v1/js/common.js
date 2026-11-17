(() => { 'use strict';
 document.querySelectorAll('.admin-app').forEach(root=>{
  const shell=root.querySelector('.app-shell');
  const sidebar = root.querySelector('.sidebar');
  const collapse = root.querySelector('.collapse-menu');
  const mobile = root.querySelector('.mobile-menu');
  const mobileViewport = matchMedia('(max-width: 768px)');
  function syncMenu() {
    const visible = mobileViewport.matches ? shell.classList.contains('menu-open') : !shell.classList.contains('is-collapsed');
    if (!visible && sidebar.contains(document.activeElement)) (mobileViewport.matches ? mobile : collapse).focus();
    sidebar.inert = !visible;
    sidebar.setAttribute('aria-hidden', String(!visible));
    collapse.setAttribute('aria-expanded', String(!shell.classList.contains('is-collapsed')));
    collapse.setAttribute('aria-label', shell.classList.contains('is-collapsed') ? '업무 메뉴 펼치기' : '업무 메뉴 접기');
    mobile.setAttribute('aria-expanded', String(shell.classList.contains('menu-open')));
  }
  collapse.addEventListener('click', () => { shell.classList.toggle('is-collapsed'); syncMenu(); });
  mobile.addEventListener('click', () => { shell.classList.toggle('menu-open'); syncMenu(); });
  mobileViewport.addEventListener('change', syncMenu);
  syncMenu();
  root.querySelectorAll('.dialog').forEach(dialog=>{let opener;dialog.addEventListener('close',()=>opener?.focus());dialog.querySelector('.close-dialog').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',event=>{if(event.target===dialog){const b=dialog.getBoundingClientRect();if(event.clientX<b.left||event.clientX>b.right||event.clientY<b.top||event.clientY>b.bottom)dialog.close();}});dialog.addEventListener('beforetoggle',event=>{if(event.newState==='open')opener=document.activeElement;});});
 });
})();

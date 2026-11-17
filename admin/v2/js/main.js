(() => {
'use strict';
document.querySelectorAll('.dashboard').forEach(root => {
 const $ = s => root.querySelector(s), $$ = s => [...root.querySelectorAll(s)];
 const motionButton = $('.motion-toggle');
 const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
 let motionPaused = false;
 try { motionPaused = localStorage.getItem('dashboard-background-paused') === 'true'; } catch (_) {}
 function syncMotion() {
  const reduced = reducedMotion.matches;
  root.classList.toggle('is-motion-running', !motionPaused && !reduced && !document.hidden);
  motionButton.hidden = false;
  motionButton.disabled = reduced;
  motionButton.setAttribute('aria-pressed', String(motionPaused || reduced));
  motionButton.textContent = reduced ? '배경 움직임 꺼짐' : motionPaused ? '배경 움직임 켜기' : '배경 움직임 끄기';
  motionButton.title = reduced ? '기기의 모션 감소 설정을 따릅니다.' : '';
 }
 motionButton.addEventListener('click', () => {
  motionPaused = !motionPaused;
  try { localStorage.setItem('dashboard-background-paused', String(motionPaused)); } catch (_) {}
  syncMotion();
 });
 reducedMotion.addEventListener('change', syncMotion);
 document.addEventListener('visibilitychange', syncMotion);
 syncMotion();
 if (!window.DASHBOARD_DATA) { $('.app-error').hidden=false; $('.app-error').textContent='샘플 데이터를 불러오지 못했습니다. js/dummydata.js 파일을 확인한 후 새로고침하세요.'; return; }
 const data=window.DASHBOARD_DATA, requests=data.requests.map(r=>({...r}));
 let filter='전체', query='', page=1, editing=null, opener=null;
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const filtered=()=>requests.filter(r=>(filter==='전체'||(filter==='미처리'?r.status!=='완료':r.status===filter))&&[r.title,r.owner,r.id].some(v=>v.toLowerCase().includes(query.toLowerCase())));
 function store(){const params=new URLSearchParams({filter,q:query,page:String(page)}); history.replaceState(null,'','#'+params.toString());}
 function render(){
  const rows=filtered(), pages=Math.max(1,Math.ceil(rows.length/6)); page=Math.min(page,pages);
  $('.rows').innerHTML=rows.slice((page-1)*6,page*6).map(r=>`<tr><td><button class="link-button" data-request="${esc(r.id)}">${esc(r.title)}</button><span class="request-id">${esc(r.id)}</span><span class="mobile-meta text small muted">${esc(r.owner)} / ${esc(r.status)} / ${esc(r.priority)} / ${r.date.slice(5).replace('-','.')}</span></td><td>${esc(r.owner)}</td><td><span class="${r.priority==='긴급'?'badge urgent':'text small muted'}">${esc(r.priority)}</span></td><td><span class="badge ${r.status==='완료'?'done':''}">${esc(r.status)}</span></td><td class="muted">${r.date.slice(5).replace('-','.')}</td></tr>`).join('');
  $('.result-count').textContent=`${rows.length}건`;
  $('.empty').hidden=rows.length!==0; $('.table-wrap').hidden=!rows.length;
  $('.page-label').textContent=`${rows.length?(page-1)*6+1:0}–${Math.min(page*6,rows.length)} / ${rows.length}건`;
  $('.previous').disabled=page===1; $('.next').disabled=page===pages; $('.export').disabled=!rows.length;
  $$('.filter-button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.filter===filter)));
  const done=requests.filter(r=>r.status==='완료').length;
  $('.open-count').textContent=requests.length-done; $('.total-count').textContent=requests.length; $('.done-count').textContent=done; $('.rate').textContent=Math.round(done/requests.length*100)+'%';
  const urgent=requests.filter(r=>r.priority==='긴급'&&r.status!=='완료'); $('.urgent-count').textContent=urgent.length+'건';
  $('.priority-list').innerHTML=urgent.slice(0,3).map(r=>`<div class="priority-item"><button class="link-button" data-request="${r.id}">${esc(r.title)}</button><span class="text small muted">${esc(r.owner)} / ${esc(r.status)}</span></div>`).join('')||'<p class="text medium muted">긴급 미처리 요청이 없습니다.</p>';
  $('.team-list').innerHTML=data.owners.map(o=>`<div class="team-row"><span class="avatar" aria-hidden="true">${esc(o.slice(0,1))}</span><div><p class="text medium">${esc(o)}</p><p class="text small muted">운영팀</p></div><span class="load">${requests.filter(r=>r.owner===o&&r.status!=='완료').length}건</span></div>`).join('');
  const series=Array.from({length:7},(_,i)=>{const date=`2026-11-${11+i}`;return {label:`11.${11+i}`,all:requests.filter(r=>r.date===date).length,done:requests.filter(r=>r.date===date&&r.status==='완료').length}}), max=Math.max(1,...series.map(s=>s.all));
  $('.chart').innerHTML=series.map(s=>`<div class="chart-column"><span>${s.all} / ${s.done}</span><div class="bars"><span class="bar" data-value="${s.all}"></span><span class="bar completed" data-value="${s.done}"></span></div><span>${s.label}</span></div>`).join('');
  $$('.bar').forEach(b=>b.style.height=(Number(b.dataset.value)/max*64)+'px');
  $('.chart').setAttribute('aria-label','접수일별 요청 수와 현재 완료 수. '+series.map(s=>`${s.label} 접수 ${s.all}건, 완료 ${s.done}건`).join('; '));
 }
 function restore(){const params=new URLSearchParams(location.hash.slice(1));filter=['전체','대기','진행 중','완료','미처리'].includes(params.get('filter'))?params.get('filter'):'전체';query=params.get('q')||'';page=Math.max(1,Number(params.get('page'))||1);$('.search').value=query;render();}
 function refresh(){store();render();}
 $$('.filter-button').forEach(b=>b.addEventListener('click',()=>{filter=b.dataset.filter;page=1;refresh();}));
 $('.search').addEventListener('input',e=>{query=e.target.value;page=1;refresh();});
 $('.reset').addEventListener('click',()=>{filter='전체';query='';page=1;$('.search').value='';refresh();});
 $('.previous').addEventListener('click',()=>{page--;refresh();});$('.next').addEventListener('click',()=>{page++;refresh();});
 $('.board-action').addEventListener('click',()=>{filter='미처리';query='';page=1;$('.search').value='';refresh();$('#requests').scrollIntoView({block:'start'});$('.search').focus({preventScroll:true});});
 const form=$('.request-form');
 form.elements.owner.innerHTML=data.owners.map(o=>`<option>${esc(o)}</option>`).join('');
 function openEditor(id,source){editing=id;opener=source;const row=requests.find(r=>r.id===id);form.reset();if(row)for(const key of ['title','owner','priority','status','note'])form.elements[key].value=row[key];$('#editor-title').textContent=row?`${row.id} 요청 상세`:'새 요청 등록';$('.editor').hidden=false;$('.editor').scrollIntoView({block:'start'});form.elements.title.focus({preventScroll:true});}
 root.addEventListener('click',e=>{const b=e.target.closest('[data-request]');if(b)openEditor(b.dataset.request,b);});
 $('.new-request').addEventListener('click',e=>openEditor(null,e.currentTarget));
 $('.close-editor').addEventListener('click',()=>{$('.editor').hidden=true;if(opener&&opener.isConnected)opener.focus();else $('.search').focus();});
 form.addEventListener('submit',e=>{e.preventDefault();const title=form.elements.title.value.trim();form.elements.title.setCustomValidity(title?'':'공백을 제외한 요청 제목을 입력하세요.');if(!form.reportValidity())return;const values=Object.fromEntries(new FormData(form));values.title=title;if(editing)Object.assign(requests.find(r=>r.id===editing),values);else requests.unshift({...values,id:`REQ-${Math.max(...requests.map(r=>Number(r.id.slice(4))))+1}`,date:'2026-11-17'});filter='전체';query='';page=1;$('.search').value='';$('.editor').hidden=true;refresh();$('.rows .link-button').focus();});
 form.elements.title.addEventListener('input',()=>form.elements.title.setCustomValidity(''));
 $('.export').addEventListener('click',()=>{const cell=v=>'"'+String(v).replace(/^[=+@-]/,"'$&").replaceAll('"','""')+'"';const csv=[['번호','요청','담당자','우선순위','상태','접수일'],...filtered().map(r=>[r.id,r.title,r.owner,r.priority,r.status,r.date])].map(row=>row.map(cell).join(',')).join('\r\n');const url=URL.createObjectURL(new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='workdesk-requests.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
 window.addEventListener('hashchange',restore);restore();
});
})();

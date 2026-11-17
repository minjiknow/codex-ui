(() => {
 'use strict';
 document.querySelectorAll('.admin-app').forEach(root=>{
 const $=selector=>root.querySelector(selector), $$=selector=>root.querySelectorAll(selector);
 const records=window.adminDemoData.records.map(record=>({...record}));
 const form=$('.filter-form'),body=$('.result-rows'),selected=new Set(),saved=new Set(),downloads=[];
 const params=new URLSearchParams(location.hash.slice(1));
 const state={org:window.adminDemoData.organizations.includes(params.get('org'))?params.get('org'):'상담 1팀',view:params.get('view')==='saved'?'saved':'all',page:Math.max(1,Number(params.get('page'))||1),size:10,ascending:false,filters:null};
 if(params.get('org')==='전체')state.org='전체';
 ['query','field','type','status','start','end','from','to','period'].forEach(name=>{if(params.has(name)){const el=form.elements.namedItem(name);el.value=params.get(name);}});
 form.elements.memo.checked=params.get('memo')==='true';
 let activeRecord=null,matches=[],visible=[];
 const node=(tag,cls,text)=>{const el=document.createElement(tag);el.className=cls;if(text!==undefined)el.textContent=text;return el;};
 const duration=seconds=>`${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;
 function readFilters(){return Object.fromEntries(new FormData(form));}
 function updateHash(){const hash=new URLSearchParams({org:state.org,view:state.view,page:String(state.page),...state.filters});const next='#'+hash.toString();try{history.replaceState(null,'',next);}catch{location.hash=next;}}
 function syncSelection() {
  const all = $('.select-all');
  const count = visible.filter(record => selected.has(record.id)).length;
  all.checked = visible.length > 0 && count === visible.length;
  all.indeterminate = count > 0 && count < visible.length;
  all.disabled = visible.length === 0;
  $('.selected-count').textContent = `${selected.size}건 선택`;
  $('.export-selected').disabled = selected.size === 0;
 }
 function openDetail(record){activeRecord=record;const grid=$('.detail-grid');grid.replaceChildren();[['녹취 번호',record.id],['조직',record.organization],['녹취 일시',record.date+' '+record.time],['통화시간',duration(record.seconds)],['상담원',record.agent],['고객명',record.customer],['전화번호',record.phone],['상담 유형',record.type]].forEach(([key,value])=>grid.append(node('dt','text small',key),node('dd','text medium',value)));$('#memo').value=record.memo;$('.detail-dialog').showModal();}
 function render(){
 const f=state.filters||readFilters(),query=(f.query||'').trim().toLocaleLowerCase();
 matches=records.filter(r=> (state.org==='전체'||r.organization===state.org)&&(state.view!=='saved'||saved.has(r.id))&&(f.type==='전체'||r.type===f.type)&&(f.status==='전체'||r.status===f.status)&&(!f.memo||r.memo)&&r.date>=f.start&&r.date<=f.end&&r.time>=f.from&&r.time<=f.to&&(!query||(f.field==='all'?[r.customer,r.agent,r.phone,r.id].join(' '):String(r[f.field]||'')).toLocaleLowerCase().includes(query))).sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time)*(state.ascending?1:-1));
 const pages=Math.max(1,Math.ceil(matches.length/state.size));state.page=Math.min(pages,Math.max(1,state.page));visible=matches.slice((state.page-1)*state.size,state.page*state.size);body.replaceChildren();
 visible.forEach((r,i)=>{const tr=node('tr','');tr.setAttribute('aria-selected',String(selected.has(r.id)));const cell=(content)=>{const td=node('td','');if(content instanceof Node)td.append(content);else td.textContent=content;tr.append(td);};
 const label=node('label','control'),checkbox=document.createElement('input');checkbox.type='checkbox';checkbox.className='control-input';checkbox.checked=selected.has(r.id);checkbox.setAttribute('aria-label',r.id+' 선택');checkbox.addEventListener('change',()=>{checkbox.checked?selected.add(r.id):selected.delete(r.id);tr.setAttribute('aria-selected',String(checkbox.checked));syncSelection();});const controlIcon=node('span','control-icon');controlIcon.setAttribute('aria-hidden','true');label.append(checkbox,controlIcon);cell(label);cell(String((state.page-1)*state.size+i+1));
 const detail=node('button','table-action','조회');detail.type='button';detail.setAttribute('aria-label',r.id+' 상세 조회');detail.addEventListener('click',()=>openDetail(r));cell(detail);
 const favorite=node('button','table-action',saved.has(r.id)?'등록됨':'등록');favorite.type='button';favorite.setAttribute('aria-pressed',String(saved.has(r.id)));favorite.setAttribute('aria-label',r.id+' 관심 등록');favorite.addEventListener('click',()=>{saved.has(r.id)?saved.delete(r.id):saved.add(r.id);render();const replacement=[...$$('.result-rows button')].find(b=>b.getAttribute('aria-label')===r.id+' 관심 등록');(replacement||$('.page-title')).focus();});cell(favorite);
 const memo=node('button','table-action',r.memo?'있음':'작성');memo.type='button';memo.setAttribute('aria-label',r.id+' 메모');memo.addEventListener('click',()=>openDetail(r));cell(memo);
 cell(r.date+' '+r.time);cell(duration(r.seconds));cell(r.agent);cell(r.type);cell(r.customer);cell(r.phone);cell(node('span','status'+(r.status==='정상'?'':' pending'),r.status));body.append(tr);});
 $('.empty').hidden=matches.length>0;$('.result-count').textContent=`총 ${matches.length}건`;$('.page-summary').textContent=`${state.page} / ${pages} 페이지`;
 const nav=$('.page-buttons');nav.replaceChildren();const pageButton=(label,page,disabled=false)=>{const button=node('button','page-button',label);button.type='button';button.disabled=disabled;if(page===state.page&&/^\d+$/.test(label))button.setAttribute('aria-current','page');button.addEventListener('click',()=>{state.page=page;render();updateHash();$('.page-buttons [aria-current=page]')?.focus();});nav.append(button);};pageButton('이전',state.page-1,state.page===1);const start=Math.max(1,Math.min(state.page-2,pages-4));for(let n=start;n<=Math.min(pages,start+4);n++)pageButton(String(n),n);pageButton('다음',state.page+1,state.page===pages);
 $$('.tree-button').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.org===state.org)));$('.scope-title').textContent=state.org==='전체'?'이음 고객센터 / 전체 조직':(['상담 1팀','상담 2팀','상담 3팀'].includes(state.org)?'인바운드팀 / 광주센터 / ':'이음 고객센터 / ')+state.org;
 const title=state.view==='saved'?'관심 녹취':'통합검색';$('.page-title').textContent=title;$('.breadcrumb-current').textContent=title;document.title=title+' | 이음 시스템';$$('[data-view]').forEach(button=>{if(button.dataset.view===state.view)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');});syncSelection();
 }
 function search(){
  const pickersValid = window.KwsPickers.validate(form);
  if (!pickersValid || !form.reportValidity()) {
    $('.search-message').textContent = '날짜와 시간의 입력값을 확인해 주세요.';
    form.querySelector('[aria-invalid="true"]')?.focus();
    return;
  }
  $('.search-message').textContent='';state.filters=readFilters();state.page=1;selected.clear();render();updateHash();
 }
 form.addEventListener('submit',event=>{event.preventDefault();search();});
 form.querySelectorAll('[name=period]').forEach(radio=>radio.addEventListener('change',()=>{if(radio.value==='custom')return;const end=new Date(window.adminDemoData.referenceDate+'T12:00:00Z'),start=new Date(end);start.setUTCDate(start.getUTCDate()-Number(radio.value)+1);form.elements.start.value=start.toISOString().slice(0,10);form.elements.end.value=end.toISOString().slice(0,10);}));
 ['start','end'].forEach(name=>form.elements[name].addEventListener('change',()=>form.elements.period.value='custom'));
 const reset=()=>{form.reset();state.org='전체';state.view='all';state.ascending=false;search();};$$('.reset-search,.empty-reset,.reset-settings').forEach(button=>button.addEventListener('click',reset));
 $$('.tree-button').forEach(button=>button.addEventListener('click',()=>{state.org=button.dataset.org;state.page=1;selected.clear();render();updateHash();}));
 function view(mode){state.view=mode;state.page=1;selected.clear();render();updateHash();}
 $$('[data-view]').forEach(button=>button.addEventListener('click',()=>view(button.dataset.view)));$('.quick-search').addEventListener('click',()=>view('all'));
 $('.select-all').addEventListener('change',event=>{visible.forEach(r=>event.target.checked?selected.add(r.id):selected.delete(r.id));render();});
 $('.page-size').addEventListener('change',event=>{state.size=Number(event.target.value);state.page=1;render();updateHash();});
 $('.sort-date').addEventListener('click',event=>{state.ascending=!state.ascending;event.currentTarget.setAttribute('aria-label',`녹취일자 ${state.ascending?'내림차순':'오름차순'} 정렬`);event.currentTarget.closest('th').setAttribute('aria-sort',state.ascending?'ascending':'descending');render();});
 $('.memo-form').addEventListener('submit',event=>{event.preventDefault();if(activeRecord)activeRecord.memo=$('#memo').value.trim();render();$('.detail-dialog').close();requestAnimationFrame(()=>{const button=[...$$('.result-rows button')].find(b=>b.getAttribute('aria-label')===activeRecord.id+' 상세 조회');(button||$('.page-title')).focus();});});
 function showInfo(title,content){$('#info-title').textContent=title;$('.info-body').replaceChildren(content);$('.info-dialog').showModal();}
 $$('.help-open').forEach(button=>button.addEventListener('click',()=>showInfo('녹취 이용 안내',node('p','text medium','조직을 선택하고 검색 조건을 입력한 뒤 검색을 누르세요. 조회에서 상세 정보와 메모를 확인할 수 있습니다. 선택 다운로드는 선택한 행의 목록을 CSV로 저장합니다. 녹취 음성, 인증, 서버 저장 기능은 연결되어 있지 않으며 새로고침하면 메모와 관심 등록이 초기화됩니다. 샘플 데이터 기준일은 2026년 11월 17일입니다.'))));
 $('.export-selected').addEventListener('click',()=>{const chosen=records.filter(r=>selected.has(r.id));if(!chosen.length)return;const quote=value=>'"'+String(value).replace(/^([=+@-])/,"'$1").replace(/"/g,'""')+'"';const csv='\uFEFF'+[['녹취번호','조직','녹취일자','시간','상담원','고객명','전화번호','상담유형','메모'],...chosen.map(r=>[r.id,r.organization,r.date,r.time,r.agent,r.customer,r.phone,r.type,r.memo])].map(row=>row.map(quote).join(',')).join('\r\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const anchor=document.createElement('a');anchor.href=url;anchor.download='ieum-recordings.csv';anchor.click();setTimeout(()=>URL.revokeObjectURL(url),1000);downloads.unshift({count:chosen.length,time:new Date().toLocaleTimeString('ko-KR')});});
 $('.download-history').addEventListener('click',()=>{const list=node('div','download-list');if(!downloads.length)list.append(node('p','text medium muted','아직 다운로드한 목록이 없습니다. 검색 결과에서 행을 선택한 뒤 다운로드하세요.'));downloads.forEach(item=>list.append(node('p','download-entry text medium',`${item.time} / ${item.count}건 / ieum-recordings.csv`)));showInfo('다운로드 이력',list);});
 let pageFavorite=false;$('.favorite-page').addEventListener('click',event=>{pageFavorite=!pageFavorite;event.currentTarget.setAttribute('aria-pressed',String(pageFavorite));event.currentTarget.textContent=pageFavorite?'즐겨찾기 해제':'즐겨찾기';});
 $('.menu-favorites').addEventListener('click',()=>{$('.menu-favorites').setAttribute('aria-pressed','true');$('.menu-all').setAttribute('aria-pressed','false');$$('.side-group').forEach(group=>group.hidden=!pageFavorite||!group.classList.contains('active'));$('.side-note').textContent=pageFavorite?'등록한 즐겨찾기 메뉴입니다.':'화면 제목 옆 즐겨찾기로 메뉴를 등록하세요.';});
 $('.menu-all').addEventListener('click',()=>{$('.menu-favorites').setAttribute('aria-pressed','false');$('.menu-all').setAttribute('aria-pressed','true');$$('.side-group').forEach(group=>group.hidden=false);$('.side-note').textContent='데모 환경. 실제 고객정보를 포함하지 않습니다.';});
 state.filters=readFilters();render();
 });
})();

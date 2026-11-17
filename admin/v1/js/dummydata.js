(() => {
 "use strict";
 const organizations = ['상담 1팀','상담 2팀','상담 3팀','고객지원팀','디지털상담팀','상품상담팀','대구상담팀','안내상담팀','운영지원팀'];
 const agents=['김서연','이도윤','박지우','최수빈','정하준','한유진'];
 const types=['상품 문의','이용 안내','변경 요청'];
 const records=Array.from({length:126},(_,i)=>({id:`REC-${String(i+1).padStart(4,'0')}`,organization:organizations[Math.floor(i/14)],date:`2026-11-${String(17-i%17).padStart(2,'0')}`,time:`${String(9+i%9).padStart(2,'0')}:${String(i*7%60).padStart(2,'0')}`,seconds:120+(i*37)%480,agent:agents[i%agents.length],customer:`샘플 고객 ${String(i+1).padStart(3,'0')}`,phone:`010-****-${String(1000+i*13).slice(-4)}`,type:types[i%3],status:i%7===0?'확인 필요':'정상',memo:i%4===0?'상담 안내 내용 확인이 필요합니다.':''}));
 window.adminDemoData=Object.freeze({referenceDate:'2026-11-17',organizations:Object.freeze(organizations),records:Object.freeze(records.map(Object.freeze))});
})();

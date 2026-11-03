/* 학습 기록: 채점할 때마다 날짜·단원·점수를 이 기기에 누적 저장하고, "내 기록" 창에서 확인/CSV 저장.
   교사용 취합: 아래 SYNC_URL에 Google Apps Script 웹앱 주소를 넣으면 기록이 구글 시트로도 전송됩니다. */
(function(){
  var SYNC_URL = '';   // 예: 'https://script.google.com/macros/s/XXXX/exec'  (비어 있으면 전송하지 않음)
  var HK='gdu-history', OB='gdu-outbox';
  function get(k){try{return JSON.parse(localStorage.getItem(k))||[]}catch(e){return []}}
  function set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
  function nm(){try{return (JSON.parse(localStorage.getItem('gdu-name'))||'').trim()}catch(e){return ''}}
  function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  function fmt(x){return (Math.round(x*10)/10).toString()}
  function pad(n){return n<10?'0'+n:''+n}
  function dstr(t){var d=new Date(t);return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())}
  function tstr(t){var d=new Date(t);return pad(d.getHours())+':'+pad(d.getMinutes())}

  function flush(){
    if(!SYNC_URL)return; var q=get(OB); if(!q.length)return;
    set(OB,[]);
    q.forEach(function(r){
      try{fetch(SYNC_URL,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(r)}).catch(function(){var o=get(OB);o.push(r);set(OB,o)})}
      catch(e){var o=get(OB);o.push(r);set(OB,o)}
    });
  }
  window.gduLog=function(n,res){
    var r={t:Date.now(),name:nm(),unit:n,score:Math.round(res.score*10)/10,total:res.total};
    var h=get(HK); h.push(r); if(h.length>5000)h=h.slice(-5000); set(HK,h);
    if(SYNC_URL){var o=get(OB);o.push({t:new Date(r.t).toISOString(),date:dstr(r.t),time:tstr(r.t),name:r.name||'(이름 없음)',unit:r.unit,score:r.score,total:r.total,pct:Math.round(r.score/r.total*100)});set(OB,o);flush();}
    refreshBadge();
  };

  var css=document.createElement('style');
  css.textContent='#rec-btn{position:fixed;left:12px;bottom:12px;z-index:9998;border:1px solid var(--line,#DDE2EC);background:var(--surface,var(--card,#fff));color:var(--ink,#172033);border-radius:12px;box-shadow:0 6px 20px rgba(20,30,60,.18);padding:9px 14px;font:600 13px system-ui,sans-serif;cursor:pointer}'+
  '#rec-btn b{background:var(--accent,var(--ac,#B8283F));color:#fff;border-radius:99px;padding:1px 7px;margin-left:6px;font-size:12px}'+
  '#rec-ov{position:fixed;inset:0;z-index:10000;background:rgba(10,16,30,.55);display:none;align-items:center;justify-content:center;padding:14px}'+
  '#rec-ov.on{display:flex}#rec-pn{background:var(--surface,var(--card,#fff));color:var(--ink,#172033);border-radius:16px;width:min(720px,100%);max-height:88vh;display:flex;flex-direction:column;overflow:hidden;font:14px/1.5 system-ui,"Noto Sans KR",sans-serif}'+
  '#rec-pn header{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-bottom:1px solid var(--line,#DDE2EC)}#rec-pn h2{margin:0;font-size:1.1rem}'+
  '#rec-pn .x{border:0;background:transparent;font-size:22px;cursor:pointer;color:inherit;line-height:1}'+
  '#rec-bd{overflow:auto;padding:14px 18px}.rec-sum{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:8px;margin-bottom:14px}'+
  '.rec-sum div{background:var(--chip,#E8EDF6);border-radius:12px;padding:10px 12px}.rec-sum span{display:block;font-size:12px;opacity:.7}.rec-sum b{font-size:1.25rem}'+
  '#rec-pn table{width:100%;min-width:0;border-collapse:collapse;font-size:13px;font-variant-numeric:tabular-nums}#rec-pn th,#rec-pn td{text-align:left;padding:7px 8px;border-bottom:1px solid var(--line,#DDE2EC)}#rec-pn th{position:sticky;top:0;background:var(--surface,var(--card,#fff));font-size:12px;opacity:.8}'+
  '#rec-pn .day td{background:var(--chip,#E8EDF6);font-weight:700}.rec-bar{display:inline-block;height:7px;border-radius:9px;background:var(--ok,#12805C);vertical-align:middle;margin-right:6px}'+
  '#rec-pn footer{display:flex;gap:8px;flex-wrap:wrap;padding:12px 18px;border-top:1px solid var(--line,#DDE2EC)}#rec-pn footer button{border:1px solid var(--line,#DDE2EC);background:var(--chip,#E8EDF6);color:inherit;border-radius:10px;padding:8px 14px;font:600 13px system-ui;cursor:pointer}'+
  '#rec-pn footer .danger{margin-left:auto;color:var(--bad,#C0302B)}.rec-empty{padding:30px 0;text-align:center;opacity:.7}.rec-note{font-size:12px;opacity:.65;margin-top:10px}'+
  '.rec-tabs{display:flex;gap:6px;margin-bottom:10px}.rec-tabs button{border:1px solid var(--line,#DDE2EC);background:transparent;color:inherit;border-radius:99px;padding:5px 12px;font:600 12px system-ui;cursor:pointer}.rec-tabs button.on{background:var(--accent,var(--ac,#B8283F));color:#fff;border-color:transparent}';
  document.head.appendChild(css);

  var btn=document.createElement('button');btn.id='rec-btn';btn.type='button';document.body.appendChild(btn);
  var ov=document.createElement('div');ov.id='rec-ov';ov.innerHTML='<div id="rec-pn" role="dialog" aria-modal="true" aria-label="내 학습 기록"><header><h2>📒 내 학습 기록</h2><button class="x" type="button" aria-label="닫기">×</button></header><div id="rec-bd"></div><footer><button type="button" id="rec-csv">CSV로 저장</button><button type="button" class="danger" id="rec-clr">기록 지우기</button></footer></div>';
  document.body.appendChild(ov);
  var tab='date', armed=false;

  function refreshBadge(){var n=get(HK).length;btn.innerHTML='📒 내 기록'+(n?'<b>'+n+'</b>':'');}
  function render(){
    var h=get(HK), bd=document.getElementById('rec-bd'), who=nm();
    if(!h.length){bd.innerHTML='<div class="rec-empty">아직 기록이 없습니다.<br>문제를 풀고 <b>채점</b>하면 날짜와 점수가 여기에 계속 쌓여요.</div>';return;}
    var days={}, units={}, sumPct=0;
    h.forEach(function(r){days[dstr(r.t)]=1;var u=units[r.unit]||(units[r.unit]={n:0,best:0,last:0,total:r.total});u.n++;u.best=Math.max(u.best,r.score);u.last=r.score;u.total=r.total;sumPct+=r.score/r.total;});
    var html='<div class="rec-sum"><div><span>'+(who?esc(who):'이름 미입력')+'</span><b>'+h.length+'회</b></div><div><span>학습한 날</span><b>'+Object.keys(days).length+'일</b></div><div><span>푼 단원</span><b>'+Object.keys(units).length+'개</b></div><div><span>평균 점수율</span><b>'+Math.round(sumPct/h.length*100)+'%</b></div></div>';
    html+='<div class="rec-tabs"><button type="button" data-t="date" class="'+(tab==='date'?'on':'')+'">날짜별</button><button type="button" data-t="unit" class="'+(tab==='unit'?'on':'')+'">단원별</button></div>';
    if(tab==='date'){
      html+='<table><thead><tr><th>시간</th><th>단원</th><th>점수</th><th></th></tr></thead><tbody>';
      var last='';
      h.slice().reverse().forEach(function(r){var d=dstr(r.t);if(d!==last){html+='<tr class="day"><td colspan="4">'+d+'</td></tr>';last=d;}
        var p=Math.round(r.score/r.total*100);
        html+='<tr><td>'+tstr(r.t)+'</td><td>Unidad '+r.unit+'</td><td>'+fmt(r.score)+' / '+r.total+'</td><td><span class="rec-bar" style="width:'+Math.max(4,p*0.6)+'px"></span>'+p+'%</td></tr>';});
      html+='</tbody></table>';
    } else {
      html+='<table><thead><tr><th>단원</th><th>도전</th><th>최근</th><th>최고</th></tr></thead><tbody>';
      Object.keys(units).map(Number).sort(function(a,b){return a-b}).forEach(function(k){var u=units[k];
        html+='<tr><td>Unidad '+k+'</td><td>'+u.n+'회</td><td>'+fmt(u.last)+' / '+u.total+'</td><td><b>'+fmt(u.best)+' / '+u.total+'</b></td></tr>';});
      html+='</tbody></table>';
    }
    html+='<p class="rec-note">기록은 이 기기의 이 브라우저에 저장됩니다. 다른 기기에서는 보이지 않으니 필요하면 CSV로 저장하세요.'+(SYNC_URL?' 선생님께도 자동 전송됩니다.':'')+'</p>';
    bd.innerHTML=html;
  }
  function open(){armed=false;document.getElementById('rec-clr').textContent='기록 지우기';render();ov.classList.add('on');}
  function close(){ov.classList.remove('on');}
  btn.addEventListener('click',open);
  ov.addEventListener('click',function(e){
    if(e.target===ov||e.target.closest('.x'))close();
    var t=e.target.closest('.rec-tabs button');if(t){tab=t.dataset.t;render();}
  });
  document.addEventListener('keydown',function(e){if(e.key==='Escape')close();});
  document.getElementById('rec-csv').addEventListener('click',function(){
    var rows=[['날짜','시간','이름','단원','점수','만점','점수율(%)']];
    get(HK).forEach(function(r){rows.push([dstr(r.t),tstr(r.t),r.name||'',r.unit,r.score,r.total,Math.round(r.score/r.total*100)]);});
    var csv='﻿'+rows.map(function(r){return r.map(function(c){return '"'+String(c).replace(/"/g,'""')+'"'}).join(',')}).join('\r\n');
    var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));a.download='학습기록_'+(nm()||'학생')+'_'+dstr(Date.now())+'.csv';document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},500);
  });
  document.getElementById('rec-clr').addEventListener('click',function(e){
    if(!armed){armed=true;e.target.textContent='정말 지울까요? 한 번 더 누르세요';return;}
    set(HK,[]);set(OB,[]);armed=false;e.target.textContent='기록 지우기';refreshBadge();render();
  });
  refreshBadge();flush();
})();

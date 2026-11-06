/* 스페인어 원어민 발음: 기기에 설치된 스페인어(es-*) 음성을 골라 읽고, 없으면 온라인 스페인어 음성으로 대체 */
(function(){
  var voices=[], audio=null, RATES=[0.7,0.8,0.9,1.0,1.1,1.2,1.3];
  function getRate(){try{var r=parseFloat(localStorage.getItem('gdu-rate'));return RATES.indexOf(r)>=0?r:0.9}catch(e){return 0.9}}
  function setRate(r){try{localStorage.setItem('gdu-rate',String(r))}catch(e){}}
  function load(){try{voices=speechSynthesis.getVoices()||[]}catch(e){voices=[]}}
  load();
  try{speechSynthesis.addEventListener('voiceschanged',load)}catch(e){}
  function score(v){
    var l=(v.lang||'').replace('_','-').toLowerCase(), n=(v.name||'').toLowerCase();
    if(l.indexOf('es')!==0)return -1;
    var s=1;
    if(l==='es-es')s+=6; else if(l==='es-mx'||l==='es-us'||l==='es-ar'||l==='es-co'||l==='es-cl')s+=4;
    if(/google|natural|neural|premium|enhanced|online|mónica|monica|paulina|helena|elvira|jorge|pablo|alvaro|álvaro|laura|sabina|diego/.test(n))s+=3;
    if(v.localService===false&&/google|online|natural/.test(n))s+=1;
    return s;
  }
  function best(){var b=null,bs=-1;voices.forEach(function(v){var s=score(v);if(s>bs){bs=s;b=v}});return bs>=0?b:null}
  function stop(){try{speechSynthesis.cancel()}catch(e){} if(audio){try{audio.pause()}catch(e){} audio=null;}}
  function online(t){
    try{
      audio=new Audio('https://translate.googleapis.com/translate_tts?ie=UTF-8&client=gtx&tl=es&q='+encodeURIComponent(t));
      audio.playbackRate=getRate(); audio.play().catch(function(){fallback(t)});
      audio.onerror=function(){fallback(t)};
    }catch(e){fallback(t)}
  }
  function fallback(t){
    try{var u=new SpeechSynthesisUtterance(t);u.lang='es-ES';u.rate=getRate();speechSynthesis.speak(u)}catch(e){}
  }
  window.gduSay=function(t){
    stop(); if(!t)return;
    if(!voices.length)load();
    var v=best();
    if(v){
      try{var u=new SpeechSynthesisUtterance(t);u.voice=v;u.lang=v.lang;u.rate=getRate();speechSynthesis.speak(u);return}catch(e){}
    }
    online(t);
  };

  /* 속도 선택기: '메인으로' 버튼 옆에 삽입 */
  var st=document.createElement('style');
  st.textContent='.rate-sel{display:inline-flex;align-items:center;gap:4px;margin-left:8px;font:600 .85rem system-ui,sans-serif;color:var(--ink,#172033);white-space:nowrap}.rate-sel select{font:600 .85rem system-ui,sans-serif;padding:5px 6px;border:1px solid var(--line,#DDE2EC);border-radius:8px;background:var(--surface,#fff);color:var(--ink,#172033)}';
  document.head.appendChild(st);
  function ensure(){
    var h=document.querySelector('.studybar .home');
    if(!h||h.parentNode.querySelector('.rate-sel'))return;
    var w=document.createElement('label');w.className='rate-sel notranslate';w.setAttribute('translate','no');
    w.innerHTML='🔊<select aria-label="예문 듣기 속도">'+RATES.map(function(r){return '<option value="'+r+'"'+(r===getRate()?' selected':'')+'>'+r.toFixed(1)+'x</option>'}).join('')+'</select>';
    w.querySelector('select').addEventListener('change',function(e){setRate(parseFloat(e.target.value));window.gduSay&&window.gduSay('Hola');});
    h.insertAdjacentElement('afterend',w);
  }
  function init(){ensure();try{new MutationObserver(ensure).observe(document.body,{childList:true,subtree:true})}catch(e){}}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();

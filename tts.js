/* 스페인어 원어민 발음: 기기에 설치된 스페인어(es-*) 음성을 골라 읽고, 없으면 온라인 스페인어 음성으로 대체 */
(function(){
  var voices=[], audio=null;
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
      audio.playbackRate=.95; audio.play().catch(function(){fallback(t)});
      audio.onerror=function(){fallback(t)};
    }catch(e){fallback(t)}
  }
  function fallback(t){
    try{var u=new SpeechSynthesisUtterance(t);u.lang='es-ES';u.rate=.9;speechSynthesis.speak(u)}catch(e){}
  }
  window.gduSay=function(t){
    stop(); if(!t)return;
    if(!voices.length)load();
    var v=best();
    if(v){
      try{var u=new SpeechSynthesisUtterance(t);u.voice=v;u.lang=v.lang;u.rate=.9;speechSynthesis.speak(u);return}catch(e){}
    }
    online(t);
  };
})();

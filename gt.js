/* Google Translate language picker (all languages). Spanish content is kept untranslated. */
(function(){
  var st=document.createElement('style');
  st.textContent='#gt-box{position:fixed;right:12px;bottom:12px;z-index:9999;background:#fff;border:1px solid #DDE2EC;border-radius:12px;box-shadow:0 6px 20px rgba(20,30,60,.18);padding:6px 10px;font:13px system-ui,sans-serif;color:#172033;display:flex;align-items:center;gap:6px}'+
  '#gt-box .goog-te-gadget{font-size:0!important;color:transparent}#gt-box .goog-te-gadget span{display:none}#gt-box .goog-te-gadget-simple{border:0!important;background:transparent!important;padding:0!important}'+
  '#gt-box select.goog-te-combo{font-size:13px;padding:4px 6px;border:1px solid #DDE2EC;border-radius:8px;background:#fff;color:#172033;max-width:150px;margin:0}'+
  'body{top:0!important}.skiptranslate>iframe.skiptranslate,iframe.goog-te-banner-frame{display:none!important}#goog-gt-tt,.goog-tooltip{display:none!important}.goog-text-highlight{background:none!important;box-shadow:none!important}';
  document.head.appendChild(st);
  var box=document.createElement('div');box.id='gt-box';box.className='notranslate';box.setAttribute('translate','no');
  box.innerHTML='<span aria-hidden="true">🌐</span><div id="google_translate_element"></div>';
  document.body.appendChild(box);
  window.googleTranslateElementInit=function(){
    new google.translate.TranslateElement({pageLanguage:'ko',layout:google.translate.TranslateElement.InlineLayout.SIMPLE,autoDisplay:false},'google_translate_element');
  };
  var s=document.createElement('script');s.src='https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';s.async=true;document.head.appendChild(s);

  /* keep Spanish untranslated */
  function nt(e){if(!e.classList.contains('notranslate')){e.classList.add('notranslate');e.setAttribute('translate','no');}}
  function wrapText(parent){
    Array.prototype.slice.call(parent.childNodes).forEach(function(n){
      if(n.nodeType===3&&n.nodeValue.trim()){var w=document.createElement('span');w.className='notranslate';w.setAttribute('translate','no');n.parentNode.replaceChild(w,n);w.appendChild(n);}
    });
  }
  var busy=false;
  function mark(){
    if(busy)return;busy=true;
    try{
      document.querySelectorAll('.es,.q,.blank,.opts,.eyebrow,.unit-tag .es').forEach(nt);
      document.querySelectorAll('h1,.c span').forEach(wrapText);
      document.querySelectorAll('.no').forEach(nt);
    }catch(e){}
    busy=false;
  }
  mark();
  var t=null;
  new MutationObserver(function(){clearTimeout(t);t=setTimeout(mark,30);}).observe(document.body,{childList:true,subtree:true});
})();

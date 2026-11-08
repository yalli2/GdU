/* 월별 접근 권한 잠금 (GdU 공통)
   - \uac19\uc740 \ud3f4\ub354\uc758 access.json(\uad00\ub9ac\uc790 \ud398\uc774\uc9c0 admin/\uc5d0\uc11c \uc800\uc7a5)\uc744 \uc77d\uc5b4 \uc774\ubc88 \ub2ec(\uc11c\uc6b8 \uc2dc\uac04 \uae30\uc900) \uc811\uadfc \uac00\ub2a5 \uc5ec\ubd80\ub97c \ud310\ub2e8\ud569\ub2c8\ub2e4.
   - \ub2ec\ubcc4 \ubaa8\ub4dc: open(\uc804\uccb4 \uacf5\uac1c) \u00b7 code(\ub4f1\ub85d \ud559\uc0dd\ub9cc) \u00b7 closed(\uc804\uccb4 \uc7a0\uae08). \uc124\uc815 \uc548 \ud55c \ub2ec\uc740 defaultMode\ub97c \ub530\ub985\ub2c8\ub2e4.
   - \ud559\uc0dd \ucf54\ub4dc\ub294 \ud574\uc2dc\ub85c\ub9cc \uc800\uc7a5\ub418\uba70, \uad00\ub9ac\uc790 \ube44\ubc00\ubc88\ud638\ub85c\ub294 \uc5b8\uc81c\ub4e0 \ub4e4\uc5b4\uac08 \uc218 \uc788\uc2b5\ub2c8\ub2e4.
   \uc0ac\uc6a9: <head> \uc548 \ub9e8 \uc55e\uc5d0 <script src="access.js" data-site="gdu"></script>  (\ub2e8\uc6d0 \ud398\uc774\uc9c0\ub294 ../access.js) */
(function(){
  'use strict';
  var me = document.currentScript;
  var LIB = me && me.getAttribute('data-lib') === '1';
  var SITE = (me && me.getAttribute('data-site')) || 'gdu';
  var BASE = me ? me.src.replace(/[^\/]*(\?.*)?$/, '') : '';
  var AKEY = 'gdu-access', PCACHE = 'gdu-access-policy', NKEY = 'gdu-name';

  /* ---------- SHA-256 (순수 JS, http/로컬 파일에서도 동작) ---------- */
  var K = [0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
  function utf8(s){ return unescape(encodeURIComponent(s)); }
  function sha256(str){
    var s = utf8(str), l = s.length, i, j, words = [];
    for (i = 0; i < l; i++) words[i >> 2] |= (s.charCodeAt(i) & 255) << (24 - (i % 4) * 8);
    words[l >> 2] |= 0x80 << (24 - (l % 4) * 8);
    words[((l + 8 >> 6) << 4) + 15] = l * 8;
    var H = [0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19], W = new Array(64);
    for (j = 0; j < words.length; j += 16) {
      var a=H[0],b=H[1],c=H[2],d=H[3],e=H[4],f=H[5],g=H[6],h=H[7];
      for (i = 0; i < 64; i++) {
        if (i < 16) W[i] = words[j + i] | 0;
        else {
          var x = W[i-15], y = W[i-2];
          W[i] = (((x>>>7|x<<25)^(x>>>18|x<<14)^(x>>>3)) + W[i-7] + ((y>>>17|y<<15)^(y>>>19|y<<13)^(y>>>10)) + W[i-16]) | 0;
        }
        var t1 = (h + ((e>>>6|e<<26)^(e>>>11|e<<21)^(e>>>25|e<<7)) + ((e&f)^(~e&g)) + K[i] + W[i]) | 0;
        var t2 = (((a>>>2|a<<30)^(a>>>13|a<<19)^(a>>>22|a<<10)) + ((a&b)^(a&c)^(b&c))) | 0;
        h=g; g=f; f=e; e=(d+t1)|0; d=c; c=b; b=a; a=(t1+t2)|0;
      }
      H[0]=(H[0]+a)|0;H[1]=(H[1]+b)|0;H[2]=(H[2]+c)|0;H[3]=(H[3]+d)|0;H[4]=(H[4]+e)|0;H[5]=(H[5]+f)|0;H[6]=(H[6]+g)|0;H[7]=(H[7]+h)|0;
    }
    var out = '';
    for (i = 0; i < 8; i++) out += ('0000000' + (H[i] >>> 0).toString(16)).slice(-8);
    return out;
  }
  function normCode(c){ return String(c || '').toUpperCase().replace(/[^A-Z0-9]/g, ''); }
  function codeHash(salt, code){ return sha256(salt + ':' + normCode(code)); }
  function adminHash(salt, pw){ var h = salt + ':admin:' + pw; for (var i = 0; i < 3000; i++) h = sha256(h); return h; }
  function seoulMonth(d){
    try {
      var p = new Intl.DateTimeFormat('en-CA', {timeZone:'Asia/Seoul', year:'numeric', month:'2-digit'}).formatToParts(d || new Date());
      var y, m; p.forEach(function(x){ if (x.type === 'year') y = x.value; if (x.type === 'month') m = x.value; });
      return y + '-' + m;
    } catch (e) { var t = new Date((d || new Date()).getTime() + 9*3600e3); return t.getUTCFullYear() + '-' + ('0' + (t.getUTCMonth()+1)).slice(-2); }
  }
  function modeFor(p, month){ return (p.months && p.months[month]) || p.defaultMode || 'open'; }

  window.GduAccess = { sha256:sha256, codeHash:codeHash, adminHash:adminHash, normCode:normCode, seoulMonth:seoulMonth, modeFor:modeFor };
  if (LIB) return;

  /* ---------- 잠금 ---------- */
  function lsGet(k){ try { return JSON.parse(localStorage.getItem(k)); } catch(e){ return null; } }
  function lsSet(k, v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch(e){} }
  function lsDel(k){ try { localStorage.removeItem(k); } catch(e){} }
  function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }

  var root = document.documentElement;
  root.classList.add('gate-wait');
  var st = document.createElement('style');
  st.textContent =
    'html.gate-wait body>*:not(#gate-ov),html.gate-lock body>*:not(#gate-ov){visibility:hidden!important}' +
    'html.gate-lock body{overflow:hidden!important}' +
    '#gate-ov{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;padding:18px;background:linear-gradient(160deg,#172033,#3a1220);font:15px/1.55 "Noto Sans KR",system-ui,-apple-system,"Segoe UI",sans-serif;color:#172033}' +
    '#gate-ov .gc{background:#fff;border-radius:20px;box-shadow:0 20px 60px rgba(0,0,0,.35);width:min(400px,100%);padding:28px 26px 22px}' +
    '#gate-ov .gk{font-size:12px;font-weight:700;letter-spacing:.08em;color:#B8283F;text-transform:uppercase}' +
    '#gate-ov h1{margin:4px 0 6px;font-size:1.35rem;line-height:1.3}#gate-ov p{margin:0 0 14px;color:#5B6679;font-size:14px}' +
    '#gate-ov label{display:block;font-size:13px;font-weight:700;margin-bottom:6px}' +
    '#gate-ov input{width:100%;box-sizing:border-box;border:1.5px solid #DDE2EC;border-radius:12px;padding:12px 14px;font:600 18px/1.2 ui-monospace,Menlo,Consolas,monospace;letter-spacing:.12em;text-transform:uppercase;color:#172033;background:#F7F8FB;outline:none}' +
    '#gate-ov input:focus{border-color:#B8283F;background:#fff}' +
    '#gate-ov button{margin-top:12px;width:100%;border:0;border-radius:12px;padding:12px;background:#B8283F;color:#fff;font:700 15px "Noto Sans KR",system-ui,sans-serif;cursor:pointer}' +
    '#gate-ov button:disabled{opacity:.6;cursor:wait}#gate-ov .ge{min-height:20px;margin-top:10px;font-size:13px;color:#C0302B;font-weight:600}' +
    '#gate-ov .gm{display:inline-block;background:#FBE4E8;color:#8f1d31;border-radius:99px;padding:2px 10px;font-size:12px;font-weight:700;margin-bottom:12px}' +
    '#gate-ov .gf{margin-top:14px;font-size:12px;color:#8a93a6;text-align:center}' +
    '#gate-chip{position:fixed;left:50%;transform:translateX(-50%);bottom:12px;z-index:9997;display:flex;align-items:center;gap:8px;background:rgba(23,32,51,.88);color:#fff;border-radius:99px;padding:5px 6px 5px 12px;font:600 12px "Noto Sans KR",system-ui,sans-serif;box-shadow:0 6px 18px rgba(0,0,0,.2)}' +
    '#gate-chip button{border:0;border-radius:99px;background:rgba(255,255,255,.18);color:#fff;font:600 11px system-ui,sans-serif;padding:4px 9px;cursor:pointer}' +
    '@media print{#gate-chip{display:none}}';
  (document.head || root).appendChild(st);

  function whenBody(fn){ if (document.body) fn(); else document.addEventListener('DOMContentLoaded', fn); }
  function monthLabel(m){ var a = m.split('-'); return a[0] + '\ub144 ' + (+a[1]) + '\uc6d4'; }

  function unlock(who){
    root.classList.remove('gate-wait', 'gate-lock');
    var ov = document.getElementById('gate-ov'); if (ov) ov.remove();
    if (!who) return;
    whenBody(function(){
      if (document.getElementById('gate-chip')) return;
      var c = document.createElement('div'); c.id = 'gate-chip';
      c.innerHTML = '<span>' + (who.admin ? '\ud83d\udd11 \uad00\ub9ac\uc790' : '\ud83d\udc64 ' + esc(who.name || '\ud559\uc0dd')) + '</span><button type="button">\ub85c\uadf8\uc544\uc6c3</button>';
      c.querySelector('button').onclick = function(){ lsDel(AKEY); location.reload(); };
      document.body.appendChild(c);
    });
  }

  function lock(p, month, kind, msg){
    root.classList.remove('gate-wait'); root.classList.add('gate-lock');
    whenBody(function(){
      var ov = document.getElementById('gate-ov');
      if (!ov) { ov = document.createElement('div'); ov.id = 'gate-ov'; document.body.appendChild(ov); }
      var title, desc, lab, ph;
      if (kind === 'closed') { title = '\uc9c0\uae08\uc740 \uc774\uc6a9 \uae30\uac04\uc774 \uc544\ub2d9\ub2c8\ub2e4'; desc = '\uc774\ubc88 \ub2ec\uc740 \uc0ac\uc774\ud2b8\uac00 \uc7a0\uaca8 \uc788\uc2b5\ub2c8\ub2e4. \uad00\ub9ac\uc790\ub9cc \ub4e4\uc5b4\uac08 \uc218 \uc788\uc5b4\uc694.'; lab = '\uad00\ub9ac\uc790 \ube44\ubc00\ubc88\ud638'; ph = ''; }
      else if (kind === 'error') { title = '\uc811\uadfc \uc815\ubcf4\ub97c \ubd88\ub7ec\uc624\uc9c0 \ubabb\ud588\uc2b5\ub2c8\ub2e4'; desc = '\uc778\ud130\ub137 \uc5f0\uacb0\uc744 \ud655\uc778\ud55c \ub4a4 \uc0c8\ub85c\uace0\uce68\ud574 \uc8fc\uc138\uc694.'; lab = '\uad00\ub9ac\uc790 \ube44\ubc00\ubc88\ud638'; ph = ''; }
      else { title = '\uc811\uadfc \ucf54\ub4dc\ub97c \uc785\ub825\ud558\uc138\uc694'; desc = '\uc120\uc0dd\ub2d8\uaed8 \ubc1b\uc740 \uc774\ubc88 \ub2ec \uc811\uadfc \ucf54\ub4dc\ub97c \uc785\ub825\ud558\uba74 \ud559\uc2b5\uc744 \uc2dc\uc791\ud560 \uc218 \uc788\uc5b4\uc694.'; lab = '\uc811\uadfc \ucf54\ub4dc'; ph = '\uc608: K7QP3M'; }
      ov.innerHTML = '<form class="gc" autocomplete="off"><div class="gk">Gram\u00e1tica de uso \u00b7 \ub2e4\uc778\uc5d0\ub4c0</div><h1>' + title + '</h1>' +
        '<div class="gm">' + monthLabel(month) + '</div><p>' + desc + '</p>' +
        '<label for="gate-in">' + lab + '</label><input id="gate-in" ' + (kind === 'code' ? 'type="text" inputmode="latin" autocapitalize="characters" spellcheck="false"' : 'type="password" style="text-transform:none;letter-spacing:normal"') + ' placeholder="' + ph + '" required>' +
        '<button type="submit">\ub4e4\uc5b4\uac00\uae30</button><div class="ge" role="alert">' + (msg ? esc(msg) : '') + '</div>' +
        '<div class="gf">\uad8c\ud55c\uc740 \ub9e4\ub2ec \uc0c8\ub85c \ud655\uc778\ub429\ub2c8\ub2e4 \u00b7 \ubb38\uc758: \ub2f4\ub2f9 \uc120\uc0dd\ub2d8</div></form>';
      var f = ov.querySelector('form'), inp = ov.querySelector('#gate-in'), err = ov.querySelector('.ge'), btn = ov.querySelector('button');
      setTimeout(function(){ try { inp.focus(); } catch(e){} }, 50);
      f.onsubmit = function(ev){
        ev.preventDefault();
        var v = inp.value; if (!v.trim()) return;
        btn.disabled = true; err.textContent = '';
        setTimeout(function(){
          var r = tryLogin(p, month, v);
          btn.disabled = false;
          if (r.ok) { lsSet(AKEY, r.save); if (r.save.name) lsSet(NKEY, r.save.name); unlock(r.save); }
          else { err.textContent = r.msg; inp.select(); }
        }, 10);
      };
    });
  }

  function findStudent(p, h){ var s = p.students || []; for (var i = 0; i < s.length; i++) if (s[i].hash === h) return s[i]; return null; }
  function allowed(stu, month){
    return !stu.disabled && (stu.months || []).indexOf(month) >= 0 && (!stu.sites || !stu.sites.length || stu.sites.indexOf(SITE) >= 0);
  }
  function tryLogin(p, month, input){
    if (p && p.salt && p.admin && p.admin.hash && adminHash(p.salt, input) === p.admin.hash)
      return { ok:true, save:{ admin:true, h:p.admin.hash } };
    if (!p || !p.salt) return { ok:false, msg:'\uc811\uadfc \uc815\ubcf4\ub97c \ubd88\ub7ec\uc624\uc9c0 \ubabb\ud588\uc2b5\ub2c8\ub2e4.' };
    var mode = modeFor(p, month);
    if (mode === 'closed') return { ok:false, msg:'\uc774\ubc88 \ub2ec\uc740 \uc7a0\uaca8 \uc788\uc2b5\ub2c8\ub2e4. \uad00\ub9ac\uc790 \ube44\ubc00\ubc88\ud638\ub9cc \uac00\ub2a5\ud569\ub2c8\ub2e4.' };
    var stu = findStudent(p, codeHash(p.salt, input));
    if (!stu) return { ok:false, msg:'\ucf54\ub4dc\uac00 \uc62c\ubc14\ub974\uc9c0 \uc54a\uc2b5\ub2c8\ub2e4. \ub2e4\uc2dc \ud655\uc778\ud574 \uc8fc\uc138\uc694.' };
    if (!allowed(stu, month)) return { ok:false, msg:stu.name + ' \ub2d8\uc740 ' + monthLabel(month) + ' \uc774\uc6a9 \uad8c\ud55c\uc774 \uc5c6\uc2b5\ub2c8\ub2e4. \uc120\uc0dd\ub2d8\uaed8 \ubb38\uc758\ud558\uc138\uc694.' };
    return { ok:true, save:{ h:stu.hash, name:stu.name } };
  }

  function decide(p){
    var month = seoulMonth(), mode = modeFor(p, month), sv = lsGet(AKEY);
    if (sv && sv.admin && p.admin && sv.h === p.admin.hash) return unlock({ admin:true });
    if (mode === 'open') return unlock(null);
    if (mode === 'closed') return lock(p, month, 'closed');
    if (sv && sv.h) {
      var stu = findStudent(p, sv.h);
      if (stu && allowed(stu, month)) { if (stu.name) lsSet(NKEY, stu.name); return unlock({ name:stu.name }); }
      lsDel(AKEY);
      return lock(p, month, 'code', stu ? stu.name + ' \ub2d8\uc740 ' + monthLabel(month) + ' \uc774\uc6a9 \uad8c\ud55c\uc774 \uc5c6\uc2b5\ub2c8\ub2e4. \uc0c8 \ucf54\ub4dc\uac00 \ud544\uc694\ud558\uba74 \uc120\uc0dd\ub2d8\uaed8 \ubb38\uc758\ud558\uc138\uc694.' : '');
    }
    lock(p, month, 'code');
  }

  var url = BASE + 'access.json?t=' + Date.now();
  var done = false;
  function fallback(){
    if (done) return; done = true;
    var c = lsGet(PCACHE);
    if (c && c.salt) decide(c); else lock(null, seoulMonth(), 'error');
  }
  try {
    fetch(url, { cache:'no-store' }).then(function(r){ if (!r.ok) throw 0; return r.json(); })
      .then(function(p){ if (done) return; done = true; lsSet(PCACHE, p); decide(p); })
      .catch(fallback);
    setTimeout(fallback, 8000);
  } catch (e) { fallback(); }
})();

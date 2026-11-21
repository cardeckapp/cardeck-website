/* CarDeck homepage: language menu, translations and the signup form. */
(function(){
  var T = window.CD_I18N || {};
  var LANG = 'en';
  var MAIL = ['roy','cardeckapp.com'].join('@');

  /* ---------- translations ---------- */
  var textEls = document.querySelectorAll('[data-i]');
  var phEls = document.querySelectorAll('[data-ph]');
  textEls.forEach(function(el){ el._en = el.innerHTML; });
  phEls.forEach(function(el){ el._en = el.getAttribute('placeholder') || ''; });

  function word(key, fallback){
    var d = T[LANG];
    return (d && d[key] != null) ? d[key] : fallback;
  }
  function apply(){
    textEls.forEach(function(el){ el.innerHTML = word(el.getAttribute('data-i'), el._en); });
    phEls.forEach(function(el){ el.setAttribute('placeholder', word(el.getAttribute('data-ph'), el._en)); });
  }

  /* ---------- language menu ---------- */
  var btns = document.querySelectorAll('.lang-menu button');
  var lbtn = document.querySelector('.lang-btn'), menu = document.querySelector('.lang-menu'), cur = document.querySelector('.lang-cur');
  function openM(o){ menu.hidden = !o; lbtn.setAttribute('aria-expanded', o ? 'true' : 'false'); lbtn.classList.toggle('open', o); }
  lbtn.addEventListener('click', function(e){ e.stopPropagation(); openM(menu.hidden); });
  document.addEventListener('click', function(e){ if (!menu.contains(e.target)) openM(false); });
  document.addEventListener('keydown', function(e){ if (e.key === 'Escape') openM(false); });

  function set(l){
    if (l !== 'en' && !T[l]) l = 'en';
    LANG = l;
    btns.forEach(function(b){
      var on = b.getAttribute('data-l') === l;
      b.classList.toggle('on', on);
      b.setAttribute('aria-checked', on ? 'true' : 'false');
      if (on) cur.textContent = b.getAttribute('data-s');
    });
    apply();
    document.documentElement.lang = l;
    try { localStorage.setItem('cd.lang', l); } catch(e){}
  }
  btns.forEach(function(b){ b.addEventListener('click', function(){ set(b.getAttribute('data-l')); openM(false); }); });
  var saved = null; try { saved = localStorage.getItem('cd.lang'); } catch(e){}
  var nav = (navigator.language || 'en').slice(0,2).toLowerCase();
  set(saved || nav);

  /* ---------- footer email (kept out of the page code to slow down spam bots) ---------- */
  document.querySelectorAll('a.mail').forEach(function(a){ a.href = 'mailto:' + MAIL; a.textContent = MAIL; });

  /* ---------- signup form: sends to the company inbox ---------- */
  var form = document.getElementById('contact');
  if (!form) return;
  var ok = form.querySelector('.msg.ok'), err = form.querySelector('.msg.err'), send = form.querySelector('button[type=submit]');
  form.addEventListener('submit', function(e){
    e.preventDefault();
    ok.hidden = true; err.hidden = true;
    var f = form.elements;
    if (f._honey.value) return; /* a bot filled the hidden field */
    var missing = ['name','company','trucks','contact'].some(function(n){ return !f[n].value.trim(); });
    if (missing){
      err.innerHTML = word('fmreq', 'Please fill in every field.');
      err.hidden = false;
      return;
    }
    var company = f.company.value.trim();
    var data = {
      _subject: 'New founding signup – ' + company,
      _template: 'table',
      _captcha: 'false',
      Name: f.name.value.trim(),
      Company: company,
      Trucks: f.trucks.value,
      'Phone or email': f.contact.value.trim(),
      'Website language': LANG.toUpperCase()
    };
    send.disabled = true;
    fetch('https://formsubmit.co/ajax/' + MAIL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(data)
    }).then(function(r){ return r.json(); }).then(function(res){
      if (res && (res.success === true || res.success === 'true')){
        form.reset();
        ok.innerHTML = word('fmok', ok._en);
        ok.hidden = false;
      } else { throw new Error('not sent'); }
    }).catch(function(){
      err.innerHTML = word('fmerr', err._en);
      err.hidden = false;
    }).then(function(){ send.disabled = false; });
  });
})();

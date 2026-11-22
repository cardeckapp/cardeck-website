/* CarDeck website: language menu, phone menu, translations, founding counter, FAQ and signup form. */
(function(){
  var T = window.CD_I18N || {};
  var LANG = 'en';
  var MAIL = ['roy','cardeckapp.com'].join('@');

  /* ---------- founding offer settings ----------
     launchDate: set to the real launch day ('2027-03-01') when the app goes live. Leave null before launch.
     spotsUrl:   address that returns the REAL number of founding members, e.g. {"taken": 12}.
                 If it is missing or fails after launch, the spots number is hidden (never guessed). */
  var OFFER = { spots: 100, days: 90, launchDate: null, spotsUrl: null };

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

  /* ---------- language menu (header) + language buttons (phone menu) ---------- */
  var btns = document.querySelectorAll('.lang-menu button');
  var mbtns = document.querySelectorAll('.menu-langs button');
  var lbtn = document.querySelector('.lang-btn'), lmenu = document.querySelector('.lang-menu'), cur = document.querySelector('.lang-cur');
  function openL(o){ lmenu.hidden = !o; lbtn.setAttribute('aria-expanded', o ? 'true' : 'false'); lbtn.classList.toggle('open', o); }
  lbtn.addEventListener('click', function(e){ e.stopPropagation(); openL(lmenu.hidden); });
  document.addEventListener('click', function(e){ if (!lmenu.contains(e.target)) openL(false); });

  function set(l){
    if (l !== 'en' && !T[l]) l = 'en';
    LANG = l;
    btns.forEach(function(b){
      var on = b.getAttribute('data-l') === l;
      b.classList.toggle('on', on);
      b.setAttribute('aria-checked', on ? 'true' : 'false');
      if (on) cur.textContent = b.getAttribute('data-s');
    });
    mbtns.forEach(function(b){ b.classList.toggle('on', b.getAttribute('data-l') === l); });
    apply();
    document.documentElement.lang = l;
    try { localStorage.setItem('cd.lang', l); } catch(e){}
  }
  btns.forEach(function(b){ b.addEventListener('click', function(){ set(b.getAttribute('data-l')); openL(false); }); });
  mbtns.forEach(function(b){ b.addEventListener('click', function(){ set(b.getAttribute('data-l')); }); });
  var saved = null; try { saved = localStorage.getItem('cd.lang'); } catch(e){}
  set(saved || (navigator.language || 'en').slice(0,2).toLowerCase());

  /* ---------- phone menu ---------- */
  var menu = document.getElementById('menu'), mopen = document.querySelector('.menu-btn'), mclose = document.querySelector('.menu-close');
  function openMenu(o){
    menu.hidden = !o;
    mopen.setAttribute('aria-expanded', o ? 'true' : 'false');
    document.body.classList.toggle('menu-open', o);
    if (o) mclose.focus(); else mopen.focus();
  }
  if (menu){
    mopen.addEventListener('click', function(){ openMenu(true); });
    mclose.addEventListener('click', function(){ openMenu(false); });
    menu.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', function(){ openMenu(false); }); });
  }
  document.addEventListener('keydown', function(e){
    if (e.key !== 'Escape') return;
    openL(false);
    if (menu && !menu.hidden) openMenu(false);
  });

  /* ---------- footer email (kept out of the page code to slow down spam bots) ---------- */
  document.querySelectorAll('a.mail').forEach(function(a){ a.href = 'mailto:' + MAIL; a.textContent = MAIL; });

  /* ---------- founding counter: only ever shows real numbers ---------- */
  function showSpots(left){
    document.querySelectorAll('[data-spots]').forEach(function(el){ el.textContent = left; });
    document.querySelectorAll('[data-bar]').forEach(function(el){ el.style.width = (left / OFFER.spots * 100) + '%'; });
  }
  function hideSpots(){
    document.querySelectorAll('[data-spots-box],[data-spots-line]').forEach(function(el){ el.hidden = true; });
  }
  (function counter(){
    if (!OFFER.launchDate){ showSpots(OFFER.spots); return; } /* before launch nobody can subscribe yet: all 100 are open */
    var start = new Date(OFFER.launchDate + 'T00:00:00');
    var daysLeft = Math.max(0, OFFER.days - Math.floor((Date.now() - start.getTime()) / 86400000));
    document.querySelectorAll('.offer-pre').forEach(function(el){ el.hidden = true; });
    document.querySelectorAll('.offer-live').forEach(function(el){ el.hidden = false; });
    document.querySelectorAll('[data-days]').forEach(function(el){ el.textContent = daysLeft; });
    function ended(){
      document.querySelectorAll('.offer-live').forEach(function(el){ el.hidden = true; });
      document.querySelectorAll('.offer-ended').forEach(function(el){ el.hidden = false; });
      document.querySelectorAll('.plan.fd').forEach(function(el){ el.classList.add('ended'); });
    }
    if (daysLeft <= 0) return ended();
    if (!OFFER.spotsUrl) return hideSpots();
    fetch(OFFER.spotsUrl, { cache: 'no-store' }).then(function(r){ return r.json(); }).then(function(d){
      var taken = Number(d && d.taken);
      if (!isFinite(taken) || taken < 0) throw new Error('bad count');
      var left = Math.max(0, OFFER.spots - taken);
      if (left === 0) return ended();
      showSpots(left);
    }).catch(hideSpots);
  })();

  /* ---------- FAQ: open the answer the link points to ---------- */
  function openHash(){
    var id = location.hash.slice(1);
    var d = id && document.getElementById(id);
    if (d && d.tagName === 'DETAILS'){ d.open = true; d.scrollIntoView({ block: 'start' }); }
  }
  openHash(); window.addEventListener('hashchange', openHash);

  /* ---------- signup form: sends to the company inbox ---------- */
  var form = document.getElementById('contact');
  if (!form || form.tagName !== 'FORM') return;
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

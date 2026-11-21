// pw-eye.js — adds a "show / hide password" eye button to every password field on the page,
// including fields created later (modals). Include once per page: <script src="/pw-eye.js" defer></script>
(function () {
  if (window.__pwEye) return; window.__pwEye = true;

  var EYE = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>';
  var EYE_OFF = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 19c-7 0-11-7-11-7a18.5 18.5 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 7 11 7a18.5 18.5 0 0 1-2.16 3.19"/><path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';

  var css = document.createElement('style');
  css.textContent =
    '.pw-eye-wrap{position:relative}' +
    '.pw-eye-wrap .pw-eye-btn{position:absolute;right:6px;transform:translateY(-50%);border:0!important;background:transparent!important;color:#64748b!important;' +
    'width:36px!important;height:36px!important;min-width:0!important;margin:0!important;box-shadow:none!important;display:flex;align-items:center;justify-content:center;' +
    'border-radius:8px!important;cursor:pointer;padding:0!important;z-index:2}' +
    '.pw-eye-wrap .pw-eye-btn:hover{color:#1e40af!important;background:rgba(30,64,175,.08)!important}' +
    '.pw-eye-btn:focus-visible{outline:2px solid #1e40af;outline-offset:1px}';
  document.head.appendChild(css);

  function isSpanish() {
    var l = '';
    try { l = localStorage.getItem('lang') || ''; } catch (e) {}
    if (!l) l = (document.documentElement.lang || 'en').slice(0, 2);
    return l.toLowerCase() === 'es';
  }
  function label(shown) {
    var es = isSpanish();
    return shown ? (es ? 'Ocultar contraseña' : 'Hide password') : (es ? 'Mostrar contraseña' : 'Show password');
  }

  function place(input, btn) {
    btn.style.top = (input.offsetTop + input.offsetHeight / 2) + 'px';
    btn.style.right = (input.offsetParent ? (input.offsetParent.clientWidth - input.offsetLeft - input.offsetWidth + 6) : 6) + 'px';
  }

  function enhance(input) {
    if (input.__pwEye) return; input.__pwEye = true;
    var wrap = document.createElement('span');
    wrap.className = 'pw-eye-wrap';
    var disp = getComputedStyle(input).display;
    wrap.style.display = (disp === 'inline' || disp === 'inline-block') ? 'inline-block' : 'block';
    if (wrap.style.display === 'block') wrap.style.width = '100%';
    input.parentNode.insertBefore(wrap, input);
    wrap.appendChild(input);

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'pw-eye-btn';
    btn.innerHTML = EYE;
    btn.setAttribute('aria-label', label(false));
    btn.title = label(false);
    btn.setAttribute('aria-pressed', 'false');
    wrap.appendChild(btn);

    var pr = parseFloat(getComputedStyle(input).paddingRight) || 0;
    if (pr < 44) input.style.paddingRight = '44px';

    btn.addEventListener('mousedown', function (e) { e.preventDefault(); }); // keep the cursor in the field
    btn.addEventListener('click', function () {
      var show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      btn.innerHTML = show ? EYE_OFF : EYE;
      btn.setAttribute('aria-pressed', show ? 'true' : 'false');
      btn.setAttribute('aria-label', label(show));
      btn.title = label(show);
    });
    // When the form is sent, hide the password again (so the browser offers to save it as a password).
    if (input.form) input.form.addEventListener('submit', function () {
      if (input.type === 'text') { input.type = 'password'; btn.innerHTML = EYE; btn.setAttribute('aria-pressed', 'false'); }
    }, true);

    var update = function () { place(input, btn); btn.style.display = input.offsetParent ? '' : 'none'; };
    update();
    window.addEventListener('resize', update);
    input.addEventListener('focus', update);
    if (window.ResizeObserver) new ResizeObserver(update).observe(input);
  }

  function scan(root) {
    var list = (root.querySelectorAll ? root.querySelectorAll('input[type="password"]') : []);
    for (var i = 0; i < list.length; i++) enhance(list[i]);
  }

  function start() {
    scan(document);
    new MutationObserver(function (muts) {
      for (var i = 0; i < muts.length; i++) {
        var nodes = muts[i].addedNodes;
        for (var j = 0; j < nodes.length; j++) {
          var n = nodes[j];
          if (n.nodeType !== 1) continue;
          if (n.matches && n.matches('input[type="password"]')) enhance(n); else scan(n);
        }
      }
    }).observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();

// Black Friday promo: shows every [data-bf] element until the end of Cyber Monday
// (Nov 30, 2026, 11:59 pm Central). After that date nothing shows; delete this file and the [data-bf] blocks when convenient.
(function(){
  var END = Date.parse('2026-12-01T06:00:00Z');
  if (Date.now() >= END) return;
  function show(){
    document.querySelectorAll('[data-bf]').forEach(function(el){ el.hidden = false; });
    document.querySelectorAll('[data-bf-copy]').forEach(function(el){
      el.addEventListener('click', function(e){
        e.preventDefault(); e.stopPropagation();
        try { navigator.clipboard.writeText('BLACKFRIDAY15'); } catch (x) {}
        var t = el.textContent; el.textContent = '✓'; setTimeout(function(){ el.textContent = t; }, 1200);
      });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', show); else show();
})();

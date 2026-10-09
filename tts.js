// tts.js — shared text-to-speech for civics / writing / vocabulary pages.
// 1) If a pre-generated neural MP3 exists for the exact text (see /audio/manifest.json,
//    built by generate_audio.js), play it — same natural voice on every device, $0 per play.
// 2) Otherwise fall back to the BEST voice the browser/OS offers (neural/natural voices first).
(function () {
  var manifest = null, manifestLoading = null, currentAudio = null, voices = [];

  function loadManifest() {
    if (manifest) return Promise.resolve(manifest);
    if (manifestLoading) return manifestLoading;
    manifestLoading = fetch('/audio/manifest.json', { cache: 'force-cache' })
      .then(function (r) { return r.ok ? r.json() : {}; })
      .catch(function () { return {}; })
      .then(function (m) { manifest = m || {}; return manifest; });
    return manifestLoading;
  }

  function refreshVoices() {
    try { voices = window.speechSynthesis.getVoices() || []; } catch (e) { voices = []; }
  }
  if ('speechSynthesis' in window) {
    refreshVoices();
    try { window.speechSynthesis.addEventListener('voiceschanged', refreshVoices); } catch (e) {}
  }

  // Higher score = more natural. Neural/"Natural"/Premium voices beat the basic ones.
  function scoreVoice(v) {
    var n = (v.name || '').toLowerCase(), s = 0;
    if (/natural|neural|online/.test(n)) s += 100;            // Microsoft Edge/Windows "Aria Online (Natural)"
    if (/premium|enhanced/.test(n)) s += 80;                  // iOS / macOS downloaded voices
    if (/google/.test(n)) s += 40;                            // Chrome "Google US English"
    if (/samantha|ava|zoe|allison|aria|jenny|guy|siri/.test(n)) s += 30;
    if (/en-us/i.test(v.lang || '')) s += 10;
    if (!v.localService) s += 5;
    if (/espeak|compact|novelty|fred|ralph|zarvox|bad news|bells/.test(n)) s -= 200; // robotic ones
    return s;
  }

  function pickVoice(lang) {
    var pref = (lang || 'en-US').slice(0, 2).toLowerCase();
    var list = voices.filter(function (v) { return v.lang && v.lang.toLowerCase().indexOf(pref) === 0; });
    if (!list.length) return null;
    if (pref === 'en') {
      var us = list.filter(function (v) { return /en[-_]us/i.test(v.lang); });
      if (us.length) list = us;
    }
    list.sort(function (a, b) { return scoreVoice(b) - scoreVoice(a); });
    return list[0];
  }

  function browserSpeak(text, lang, rate) {
    if (!('speechSynthesis' in window) || !text) return;
    try {
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(text);
      u.lang = lang || 'en-US';
      u.rate = rate || 0.95;
      var v = pickVoice(u.lang);
      if (v) u.voice = v;
      window.speechSynthesis.speak(u);
    } catch (e) {}
  }

  function stopSpeech() {
    if (currentAudio) { try { currentAudio.pause(); } catch (e) {} currentAudio = null; }
    if ('speechSynthesis' in window) { try { window.speechSynthesis.cancel(); } catch (e) {} }
  }

  // speakText(text, lang, rate) — lang like 'en-US' / 'es-ES'
  window.speakText = function (text, lang, rate) {
    if (!text) return;
    stopSpeech();
    var key = (String(lang || 'en-US').slice(0, 2).toLowerCase()) + '|' + String(text).trim();
    loadManifest().then(function (m) {
      var file = m[key];
      if (!file) { browserSpeak(text, lang, rate); return; }
      try {
        var a = new Audio('/audio/' + file);
        currentAudio = a;
        a.onerror = function () { browserSpeak(text, lang, rate); };
        var p = a.play();
        if (p && p.catch) p.catch(function () { browserSpeak(text, lang, rate); });
      } catch (e) { browserSpeak(text, lang, rate); }
    });
  };
  window.ttsStop = stopSpeech;
})();

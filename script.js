// script.js — lädt data.json, rendert die Karten, Suche/Filter, und TTS
// Erweiterung: erkennt verfügbare Stimmen (Deutsch/Arabisch) und bietet Google-Translate-Fallback an.

// UI elements
const grid = document.getElementById('grid');
const qInput = document.getElementById('q');
const categorySelect = document.getElementById('categorySelect');
const sortSelect = document.getElementById('sortSelect');
const countEl = document.getElementById('count');
const showAllBtn = document.getElementById('showAll');

let PHRASES = [];
let AVAILABLE = { de: false, ar: false };
let VOICES = [];

// Load data.json and initialize
async function loadData(){
  try{
    const res = await fetch('data.json');
    PHRASES = await res.json();
    // load voices and then build UI
    await loadVoices();
    buildCategories();
    filterAndRender();
  }catch(e){
    grid.innerHTML = `<div class="card">Fehler beim Laden der Daten (data.json). Stelle sicher, dass die Datei im selben Ordner liegt.</div>`;
    console.error(e);
  }
}

// Load voices (some browsers load asynchronously)
function loadVoices(){
  return new Promise(resolve => {
    function setVoices(){
      VOICES = window.speechSynthesis.getVoices() || [];
      AVAILABLE.de = VOICES.some(v => v.lang && v.lang.toLowerCase().startsWith('de'));
      AVAILABLE.ar = VOICES.some(v => v.lang && v.lang.toLowerCase().startsWith('ar'));
      // also accept 'ar-SA', 'ar-EG', etc.
      // expose debug in console
      console.log('Voices loaded', VOICES.map(v=>v.lang));
      resolve();
    }
    setVoices();
    if (typeof speechSynthesis !== 'undefined') {
      // onvoiceschanged may fire later
      speechSynthesis.onvoiceschanged = () => {
        setVoices();
      };
    }
  });
}

function buildCategories(){
  const cats = [...new Set(PHRASES.map(p=>p.cat || 'Uncategorized'))].sort();
  categorySelect.innerHTML = `<option value="all">Alle Kategorien</option>` + cats.map(c=>`<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
}

function escapeHtml(s){ return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;'); }

function render(list){
  grid.innerHTML = '';
  countEl.textContent = `${list.length} Ergebnisse`;
  list.forEach(item=>{
    const card = document.createElement('article'); card.className='card';
    const row = document.createElement('div'); row.className='lang-row';
    const de = document.createElement('div'); de.className='de-text'; de.textContent = item.de;
    const ar = document.createElement('div'); ar.className='ar-text'; ar.textContent = item.ar; ar.setAttribute('dir','rtl');
    row.appendChild(de); row.appendChild(ar);

    const meta = document.createElement('div'); meta.className='meta'; meta.innerHTML = `<strong>${escapeHtml(item.cat || '')}</strong>`;

    const plays = document.createElement('div'); plays.className='playbuttons';
    const btnDe = document.createElement('button'); btnDe.className='btn'; btnDe.textContent='🔊 Deutsch';
    btnDe.onclick = ()=> speakText(item.de, 'de');

    // Arabic: if local voice available, normal button; if not, show disabled + translator fallback
    const btnAr = document.createElement('button'); btnAr.className='btn';
    if (AVAILABLE.ar) {
      btnAr.textContent = '🔊 العربية';
      btnAr.onclick = ()=> speakText(item.ar, 'ar');
    } else {
      btnAr.textContent = '🔇 العربية (nicht verfügbar)';
      btnAr.disabled = true;
      btnAr.title = 'Keine lokale arabische Stimme gefunden.';
    }

    // Always provide a Google Translate fallback button (legal - opens Google Translate in new tab)
    const btnTranslate = document.createElement('button'); btnTranslate.className='btn';
    btnTranslate.textContent = '🌐 Übersetzer';
    btnTranslate.title = 'Im Google Übersetzer öffnen (Aussprache)';
    btnTranslate.onclick = ()=> openGoogleTranslate(item.de, 'de', 'ar');

    plays.appendChild(btnDe);
    plays.appendChild(btnAr);
    plays.appendChild(btnTranslate);

    card.appendChild(row);
    card.appendChild(meta);
    card.appendChild(plays);
    grid.appendChild(card);
  });
}

function sanitize(s){return (s||'').toString().toLowerCase();}

function filterAndRender(){
  const q = sanitize(qInput.value.trim());
  const cat = categorySelect.value;
  let results = PHRASES.filter(p=>{
    const matchQ = q.length===0 || sanitize(p.de).includes(q) || sanitize(p.ar).includes(q) || (p.tags && p.tags.join(' ').toLowerCase().includes(q));
    const matchCat = (cat==='all') || p.cat===cat;
    return matchQ && matchCat;
  });
  if(sortSelect.value==='alpha') results = results.slice().sort((a,b)=>a.de.localeCompare(b.de,'de'));
  render(results);
}

qInput.addEventListener('input', filterAndRender);
categorySelect.addEventListener('change', filterAndRender);
sortSelect.addEventListener('change', filterAndRender);
showAllBtn.addEventListener('click', ()=>{ qInput.value=''; categorySelect.value='all'; sortSelect.value='relevance'; filterAndRender(); });

// Improved speakText with retries and friendly message
function speakText(text, langCode){
  if(!window.speechSynthesis){
    alert('Ihr Browser unterstützt keine Sprachausgabe (Web Speech API). Verwende Chrome/Edge/Firefox auf Desktop/Mobil.');
    return;
  }

  // ensure voices loaded
  let voices = window.speechSynthesis.getVoices();
  if(!voices || voices.length === 0){
    // try to wait briefly for voices to load
    window.speechSynthesis.onvoiceschanged = () => {
      speakText(text, langCode);
    };
    return;
  }

  // normalize and choose voice
  const prefix = (langCode || 'de').toLowerCase().split(/[-_]/)[0];
  let voice = voices.find(v => v.lang && v.lang.toLowerCase().startsWith(prefix));
  if(!voice){
    voice = voices.find(v => v.lang && v.lang.toLowerCase().includes(prefix));
  }

  if(!voice){
    const langName = prefix === 'ar' ? 'Arabisch' : (prefix === 'de' ? 'Deutsch' : langCode);
    // friendly modal-like message with option to open Google Translate
    if (confirm(`${langName} - Stimme nicht lokal verfügbar. Möchtest du den Satz im Google Übersetzer öffnen, um die Aussprache zu hören?`)) {
      openGoogleTranslate(text, (prefix === 'de' ? 'de' : 'auto'), (prefix === 'ar' ? 'ar' : 'ar'));
    }
    return;
  }

  const u = new SpeechSynthesisUtterance(text);
  u.voice = voice;
  u.lang = voice.lang || langCode;
  u.rate = 1.0;
  u.pitch = 1.0;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

// Open Google Translate in new tab with prefilled text
function openGoogleTranslate(text, source='de', target='ar'){
  const encoded = encodeURIComponent(text);
  const url = `https://translate.google.com/?sl=${source}&tl=${target}&text=${encoded}&op=translate`;
  window.open(url, '_blank');
}

// register service worker for PWA (if available)
if('serviceWorker' in navigator){
  navigator.serviceWorker.register('service-worker.js').then(()=>{ console.log('Service Worker registered'); }).catch(()=>{ console.log('SW reg failed'); });
}

// kickoff
loadData();

// script.js — lädt data.json, rendert die Karten, Suche/Filter, und TTS

const grid = document.getElementById('grid');
const qInput = document.getElementById('q');
const categorySelect = document.getElementById('categorySelect');
const sortSelect = document.getElementById('sortSelect');
const countEl = document.getElementById('count');
const showAllBtn = document.getElementById('showAll');

let PHRASES = [];

async function loadData(){
  try{
    const res = await fetch('data.json');
    PHRASES = await res.json();
    buildCategories();
    filterAndRender();
  }catch(e){
    grid.innerHTML = `<div class="card">Fehler beim Laden der Daten (data.json). Stelle sicher, dass die Datei im selben Ordner liegt.</div>`;
    console.error(e);
  }
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
    btnDe.onclick = ()=> speakText(item.de, 'de-DE');
    const btnAr = document.createElement('button'); btnAr.className='btn'; btnAr.textContent='🔊 العربية';
    btnAr.onclick = ()=> speakText(item.ar, 'ar-SA');

    plays.appendChild(btnDe); plays.appendChild(btnAr);

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

// Text-to-Speech with voice heuristics
function speakText(text, lang){
  if(!window.speechSynthesis){ alert('Ihr Browser unterstützt keine Sprachausgabe (Web Speech API). Verwende Chrome/Edge/Firefox auf Desktop/Mobil.'); return; }
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = lang;

  const voices = window.speechSynthesis.getVoices();
  if(voices && voices.length){
    let voice = voices.find(v=>v.lang && v.lang.toLowerCase().startsWith(lang.toLowerCase()));
    if(!voice){
      if(lang.startsWith('de')) voice = voices.find(v=>v.lang && v.lang.startsWith('de'));
      if(lang.startsWith('ar')) voice = voices.find(v=>v.lang && v.lang.startsWith('ar'));
    }
    if(voice) utter.voice = voice;
  }

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utter);
}

// ensure voices loaded (some browsers async)
if(typeof speechSynthesis !== 'undefined'){
  speechSynthesis.onvoiceschanged = ()=>{};
}

// register service worker for PWA (if available)
if('serviceWorker' in navigator){
  navigator.serviceWorker.register('service-worker.js').then(()=>{ console.log('Service Worker registered'); }).catch(()=>{ console.log('SW reg failed'); });
}

// kickoff
loadData();

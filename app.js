// app.js — Hauptlogik
const CHARACTERS = {
  "Hu Tao": {level:90, hp:15552, atk:715, def:876, em:0, cr:33.1, cd:69.2, hb:0, er:0},
  "Raiden Shogun": {level:90, hp:12084, atk:335, def:721, em:0, cr:5.0, cd:50.0, hb:0, er:200},
  "Kamisato Ayaka": {level:90, hp:12872, atk:300, def:716, em:0, cr:5.0, cd:50.0, hb:0, er:0},
  "Zhongli": {level:90, hp:12345, atk:320, def:980, em:0, cr:5.0, cd:50.0, hb:0, er:0},
  "Nahida": {level:90, hp:10234, atk:210, def:600, em:120, cr:5.0, cd:50.0, hb:0, er:0}
};

// DOM
const charSelect = document.getElementById('charSelect');
const levelSelect = document.getElementById('levelSelect');
const weaponLevel = document.getElementById('weaponLevel');
const hp = document.getElementById('hp');
const atk = document.getElementById('atk');
const def = document.getElementById('def');
const em = document.getElementById('em');
const cr = document.getElementById('cr');
const cd = document.getElementById('cd');
const hb = document.getElementById('hb');
const er = document.getElementById('er');
const artifactsDiv = document.getElementById('artifacts');
const calcBtn = document.getElementById('calc');
const scoreDiv = document.getElementById('score');
const overviewName = document.getElementById('overviewName');
const overviewLevel = document.getElementById('overviewLevel');
const detailList = document.getElementById('detailList');
const addSet = document.getElementById('addSet');
const loadExample = document.getElementById('loadExample');
const clearBtn = document.getElementById('clear');
const saveBtn = document.getElementById('save');
const exportBtn = document.getElementById('export');
const downloadZipBtn = document.getElementById('downloadZip');

// utilities
function populateSelect(sel, arr){ sel.innerHTML=''; arr.forEach(v=>{const o=document.createElement('option'); o.value=v; o.textContent=v; sel.appendChild(o)}); }
populateSelect(charSelect, Object.keys(CHARACTERS));
populateSelect(levelSelect, Array.from({length:90},(_,i)=>i+1));
populateSelect(weaponLevel, Array.from({length:90},(_,i)=>i+1));

function makeArtifactBlock(name){
  const div = document.createElement('div'); div.className='artifact';
  div.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
      <div style="font-weight:700">${name}</div>
      <button class="btn remove">Entfernen</button>
    </div>
    <label>Haupt-Attribut</label>
    <input class="art-main" placeholder="z. B. HP% / ATK% / Pyro DMG Bonus" />
    <label style="margin-top:8px">Nebenstats (bis 5)</label>
    <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:6px;margin-top:6px">
      <input class="art-sub" placeholder="z. B. CR 7.0" />
      <input class="art-sub" placeholder="z. B. CD 14.0" />
      <input class="art-sub" placeholder="z. B. ATK% 5.8" />
      <input class="art-sub" placeholder="z. B. ER 5.2" />
      <input class="art-sub" placeholder="z. B. HP% 4.1" />
    </div>
  `;
  div.querySelector('.remove').addEventListener('click',()=>div.remove());
  return div;
}

function initDefaultArtifacts(){ artifactsDiv.innerHTML=''; ['Blume','Feder','Sanduhr','Kelch','Haarreif'].forEach(n=>artifactsDiv.appendChild(makeArtifactBlock(n))); }
initDefaultArtifacts();
addSet.addEventListener('click',()=>artifactsDiv.appendChild(makeArtifactBlock('Extra')));

loadExample.addEventListener('click',()=>loadCharacter('Hu Tao'));
clearBtn.addEventListener('click',()=>{ document.querySelectorAll('input').forEach(i=>i.value=''); scoreDiv.textContent='Gesamtstärke: —'; detailList.textContent='Noch keine Berechnung'; overviewName.textContent='—'; overviewLevel.textContent='—'; });

charSelect.addEventListener('change', ()=>loadCharacter(charSelect.value));

function loadCharacter(name){ const c = CHARACTERS[name]; if(!c) return; overviewName.textContent = name; overviewLevel.textContent = `Level ${c.level}`; levelSelect.value = c.level; hp.value = c.hp; atk.value = c.atk; def.value = c.def; em.value = c.em; cr.value = c.cr; cd.value = c.cd; hb.value = c.hb; er.value = c.er; }
loadCharacter('Hu Tao');

function parseNum(str){ return parseFloat((str||'').match(/[-+\d\.]+/)?.[0]||0); }

function calculateScore(data){
  const atkScore = data.atk * 1.6;
  const critScore = (data.cr/100) * (1 + data.cd/100) * 200;
  const emScore = data.em * 0.8;
  const erScore = Math.max(0, data.er-100) * 0.6;
  const hpScore = data.hp * 0.08;
  const defScore = data.def * 0.05;
  const healScore = data.hb * 2;

  let artBonus = 0;
  data.artifacts.forEach(a=>{
    if(!a) return;
    if(a.main){ if(/pyro/i.test(a.main)) artBonus += 40; if(/atk%/i.test(a.main)) artBonus += 25; if(/hp%/i.test(a.main)) artBonus += 10; if(/em/i.test(a.main)) artBonus += 18; }
    (a.subs||[]).forEach(s=>{
      const num = parseNum(s);
      if(/cr/i.test(s)) artBonus += (num||0)*8;
      if(/cd/i.test(s)) artBonus += (num||0)*4;
      if(/atk%/i.test(s)) artBonus += (num||0)*3.5;
      if(/er/i.test(s)) artBonus += (num||0)*2.5;
      if(/em/i.test(s)) artBonus += (num||0)*1.8;
      if(/hp%/i.test(s)) artBonus += (num||0)*1.2;
    })
  });

  let weaponBonus = 0;
  if(data.weapon && data.weapon.main){ const m = data.weapon.main.toLowerCase(); if(m.includes('atk')) weaponBonus += 20; if(m.includes('%')) weaponBonus += 15; if(m.includes('er')) weaponBonus += 18; if(m.includes('pyro')) weaponBonus += 25; }

  const raw = atkScore + critScore + emScore + erScore + hpScore + defScore + healScore + artBonus + weaponBonus;
  const norm = Math.round(raw/10);
  return {raw,score:norm,components:{atkScore,critScore,emScore,erScore,hpScore,defScore,healScore,artBonus,weaponBonus}};
}

function gatherData(){
  const arts = [];
  artifactsDiv.querySelectorAll('.artifact').forEach(node=>{
    const main = node.querySelector('.art-main')?.value||'';
    const subs = Array.from(node.querySelectorAll('.art-sub')).map(i=>i.value).filter(Boolean);
    arts.push({main,subs});
  });
  return {
    character: charSelect.value,
    level: parseInt(levelSelect.value||0),
    hp: parseFloat(hp.value||0),
    atk: parseFloat(atk.value||0),
    def: parseFloat(def.value||0),
    em: parseFloat(em.value||0),
    cr: parseFloat(cr.value||0),
    cd: parseFloat(cd.value||0),
    hb: parseFloat(hb.value||0),
    er: parseFloat(er.value||0),
    artifacts: arts,
    weapon: {name: document.getElementById('weaponName').value, main: document.getElementById('weaponMain').value}
  };
}

calcBtn.addEventListener('click', ()=>{
  const data = gatherData();
  const res = calculateScore(data);
  scoreDiv.textContent = `Gesamtstärke: ${res.score}`;
  detailList.innerHTML = Object.entries(res.components).map(([k,v])=>`<div>${k}: ${Math.round(v)}</div>`).join('');
  localStorage.setItem('lastBuild', JSON.stringify({data,res,ts:Date.now()}));
  showToast('Berechnung abgeschlossen');
});

saveBtn.addEventListener('click', ()=>{ const data=gatherData(); const key=`build_${data.character}_${Date.now()}`; localStorage.setItem(key,JSON.stringify(data)); showToast('Build gespeichert (LocalStorage)'); });

exportBtn.addEventListener('click', ()=>{ const data=gatherData(); const blob = new Blob([JSON.stringify(data,null,2)],{type:'application/json'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`${data.character||'build'}.json`; a.click(); URL.revokeObjectURL(url); showToast('JSON exportiert'); });

// Simple ZIP project builder (client-side) — creates a small ZIP containing files
// We implement a tiny zip creator using JSZip if available; if not, fallback export of HTML only
downloadZipBtn.addEventListener('click', async ()=>{
  if(window.JSZip){
    const zip = new JSZip();
    zip.file('index.html', await (await fetch('/index.html')).text());
    zip.file('styles.css', await (await fetch('/styles.css')).text());
    zip.file('app.js', await (await fetch('/app.js')).text());
    zip.file('manifest.json', await (await fetch('/manifest.json')).text());
    zip.file('sw.js', await (await fetch('/sw.js')).text());
    const content = await zip.generateAsync({type:'blob'});
    const url = URL.createObjectURL(content); const a=document.createElement('a'); a.href=url; a.download='genshin-webapp.zip'; a.click(); URL.revokeObjectURL(url);
  } else {
    showToast('JSZip nicht verfügbar — lade stattdessen index.html herunter');
    const html = await (await fetch('/index.html')).text(); const blob = new Blob([html],{type:'text/html'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='index.html'; a.click(); URL.revokeObjectURL(url);
  }
});

function showToast(text){ const t = document.getElementById('toast'); t.textContent=text; t.hidden=false; setTimeout(()=>t.hidden=true,2000); }

// PWA: Service Worker registration
if('serviceWorker' in navigator){ navigator.serviceWorker.register('/sw.js').catch(()=>{}); }

// restore last build
(function restoreLast(){ const last = localStorage.getItem('lastBuild'); if(last){ try{ const parsed = JSON.parse(last); const d = parsed.data||{}; if(d.character) charSelect.value = d.character; if(d.level) levelSelect.value = d.level; if(d.hp) hp.value = d.hp; if(d.atk) atk.value = d.atk; if(d.def) def.value = d.def; if(d.em) em.value = d.em; if(d.cr) cr.value = d.cr; if(d.cd) cd.value = d.cd; if(d.er) er.value = d.er; }catch(e){} } })();

const API='/api';
const $=id=>document.getElementById(id);
let token=localStorage.getItem('nz_token')||'',pending=[],catalog={};
let localLessons=JSON.parse(localStorage.getItem('nz_local_lessons')||'[]');
const stepsDefault=['Mise en situation','Observation / recherche','Échanges et structuration','Synthèse','Application','Évaluation et remédiation'];
const stepsDuration=['10 min','15 min','15 min','10 min','15 min','10 min'];
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function auth(){return token?{Authorization:'Bearer '+token}:{}}
async function api(path,opts={}){const r=await fetch(API+path,{...opts,headers:{...(opts.body instanceof FormData?{}:{'Content-Type':'application/json'}),...auth(),...(opts.headers||{})}});if(!r.ok){let e={};try{e=await r.json()}catch{}throw Error(e.error||`Erreur ${r.status}`)}return r.status===204?null:r.json()}
function tab(name){document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('show',x.id===name));document.querySelectorAll('nav button').forEach(x=>x.classList.toggle('selected',x.dataset.tab===name))}
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>tab(b.dataset.tab));
document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>tab(b.dataset.go));
function fillSelect(el,values){el.innerHTML=values.map(v=>`<option>${esc(v)}</option>`).join('')}
async function initCatalog(){try{catalog=await api('/catalog')}catch{catalog={disciplines:{'Français':['Grammaire','Orthographe','Conjugaison','Lecture compréhension'],'Mathématiques':['Numération','Calcul','Géométrie']},steps:{default:stepsDefault}}}fillSelect($('discipline'),Object.keys(catalog.disciplines));subOptions()}
function subOptions(){fillSelect($('subDiscipline'),catalog.disciplines[$('discipline').value]||[])}
$('discipline').onchange=subOptions;

// --- FICHE PROPRE VERSION INSPECTION CONGO ---
function renderLesson(l,i){
  const dateStr = new Date().toLocaleDateString('fr-FR');
  const rows = l.steps.map((s,idx)=>{
    const acts = [
      ['Présente la situation, pose des questions de rappel.','Écoute, répond, observe la situation.','Questions orales'],
      ['Présente le matériel, guide l’observation.','Observe, manipule, découvre la règle.','Matériel / Ardoise'],
      ['Anime les échanges, corrige et structure.','Échange, propose, justifie.','Tableau / Cahier'],
      ['Fait formuler la règle avec les élèves.','Répète et recopie la synthèse.','Cahier de leçon'],
      ['Propose des exercices d’application.','Applique la règle seul puis en groupe.','Exercices / Ardoise'],
      ['Propose l’évaluation, corrige et remédie.','Fait l’évaluation, se corrige.','Fiche d’évaluation']
    ][idx] || ['Guide et vérifie.','Observe et applique.','À préciser'];
    return `<tr><td><b>${esc(s)}</b></td><td>${stepsDuration[idx]||'10 min'}</td><td>${acts[0]}</td><td>${acts[1]}</td><td>${acts[2]}</td></tr>`;
  }).join('');
  return `<article class="lesson fiche-pro">
  <div style="border:2px solid #0b3d2e;padding:12px;border-radius:10px;background:#fff;color:#111">
    <div style="text-align:center;border-bottom:2px solid #0b3d2e;padding-bottom:8px">
      <div style="font-size:11px;letter-spacing:1px">RÉPUBLIQUE DU CONGO • MINISTÈRE DE L'ENSEIGNEMENT</div>
      <h2 style="margin:6px 0;color:#0b3d2e">FICHE PÉDAGOGIQUE N° ${i+1}</h2>
      <div style="font-size:13px"><b>${esc(l.discipline)} • ${esc(l.subDiscipline)}</b> — ${esc(l.theme)}</div>
    </div>
    <table style="width:100%;margin:10px 0;border-collapse:collapse;font-size:13px"><tr>
      <td style="border:1px solid #ccc;padding:6px"><b>Classe :</b> ${esc(l.classLevel)}</td>
      <td style="border:1px solid #ccc;padding:6px"><b>Date :</b> ${dateStr}</td>
      <td style="border:1px solid #ccc;padding:6px"><b>Durée :</b> 75 min</td>
    </tr></table>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin:10px 0">
      <div style="border:1px solid #0b3d2e;padding:8px;border-radius:8px;background:#eef7f1"><b>🎯 OG</b><br>${esc(l.objectiveGeneral||'À compléter')}</div>
      <div style="border:1px solid #0b3d2e;padding:8px;border-radius:8px;background:#fff8e6"><b>📌 OS</b><br>${esc(l.objectiveSpecific||'À compléter')}</div>
      <div style="border:1px solid #0b3d2e;padding:8px;border-radius:8px;background:#eef2ff"><b>✅ OA</b><br>${esc(l.learningObjective||'À compléter')}</div>
    </div>
    <p style="font-size:13px"><b>Prérequis :</b> ${esc(l.prerequisites||'À compléter')} | <b>Supports :</b> ${esc(l.materials||'À compléter')}</p>
    <h3 style="color:#0b3d2e;margin:10px 0 6px">DÉROULEMENT — TABLEAU OFFICIEL 5 COLONNES</h3>
    <table style="width:100%;border-collapse:collapse;font-size:12.5px">
      <tr style="background:#0b3d2e;color:#fff"><th style="border:1px solid #0b3d2e;padding:7px;text-align:left">Étape</th><th style="border:1px solid #0b3d2e;padding:7px">Durée</th><th style="border:1px solid #0b3d2e;padding:7px;text-align:left">Activités du Maître</th><th style="border:1px solid #0b3d2e;padding:7px;text-align:left">Activités des Élèves</th><th style="border:1px solid #0b3d2e;padding:7px;text-align:left">Évaluation / Supports</th></tr>
      ${rows}
    </table>
    <div style="margin-top:12px;border:2px dashed #d4a017;background:#fffbe6;padding:10px;border-radius:8px"><b>📋 RÉSUMÉ À COPIER AU TABLEAU :</b><br>${esc(l.learningObjective||l.theme)} — L’élève doit être capable de : ${esc(l.objectiveSpecific||'appliquer la règle vue.')}</div>
    <div id="inspect-${l.localId||i}" style="margin-top:10px;padding:10px;border-radius:8px;background:#f1f5f9;font-size:13px"><b>🕵️ Inspecteur Gemini :</b> <span>Pas encore vérifié. Clique sur Vérifier.</span></div>
    <div style="display:flex;justify-content:space-between;margin-top:14px;font-size:13px"><div><button onclick="inspectFiche(${i},'${esc(l.localId||'')}')" style="background:#0b3d2e;color:#fff;border:0;padding:9px 14px;border-radius:8px;font-weight:700">🕵️ Vérifier par l'Inspecteur Gemini</button></div><div style="text-align:right">L'Enseignant<br><br>__________________</div><div style="text-align:right">Le Directeur<br><br>__________________</div></div>
    <p style="text-align:center;font-size:11px;color:#666;margin-top:10px">NZOLANI • ${l.status==='VALIDATED'?'Validée par l’enseignant':'Brouillon à vérifier'} • Vérifier avec les programmes officiels du Congo</p>
  </div></article>`;
}
function makeLesson(theme,i){let key=$('discipline').value+'|'+$('subDiscipline').value;return {classLevel:$('classLevel').value,discipline:$('discipline').value,subDiscipline:$('subDiscipline').value,theme,objectiveGeneral:$('og').value,objectiveSpecific:$('os').value,learningObjective:$('oa').value,prerequisites:$('prerequisites').value,materials:$('materials').value,instructions:$('instructions').value,steps:catalog.steps?.[key]||catalog.steps?.default||stepsDefault,status:'DRAFT',localId:`${Date.now()}-${i}`}}
// --- INSPECTEUR GEMINI : appelle le serveur, jamais la clé en direct ---
async function inspectFiche(i,localId){
  const l = pending[i] || localLessons[i] || [...localLessons][i];
  const box = document.getElementById('inspect-'+(localId||i));
  if(box) box.innerHTML='<b>🕵️ Inspecteur Gemini :</b> Vérification en cours...';
  try{
    const r = await api('/inspect',{method:'POST',body:JSON.stringify({lesson:l||pending[i]})});
    if(box) box.innerHTML = `<b>🕵️ Inspecteur Gemini : ${esc(r.verdict||'À vérifier')}</b><br>Note : ${esc(r.score||'-')}/20<br>${esc(r.feedback||r.answer||'Fiche analysée.')}`;
  }catch(e){
    if(box) box.innerHTML = `<b>🕵️ Inspecteur Gemini (local) :</b><br>✅ OG/OS/OA présents : ${l?.objectiveGeneral&&l?.objectiveSpecific&&l?.learningObjective?'Oui':'Non — à compléter'}<br>✅ Tableau 5 colonnes : Oui<br>⚠️ Serveur /inspect non configuré. Ajoute GEMINI_API_KEY dans Render et l'endpoint /inspect dans server.js pour la vraie vérification IA.`;
  }
}
window.inspectFiche = inspectFiche;
$('preview').onclick=()=>{let n=+$('count').value,themes=$('themes').value.split(/\n+/).map(x=>x.trim()).filter(Boolean);if(!themes.length)themes=['Thème à préciser'];if(n===10){while(themes.length<10)themes.push('Thème '+(themes.length+1));themes=themes.slice(0,10)}else themes=themes.slice(0,1);pending=themes.map(makeLesson);$('previewArea').innerHTML=pending.map(renderLesson).join('');$('validate').disabled=false};
$('validate').onclick=async()=>{if(!pending.length)return;if(!confirm('Confirmez-vous la validation et l’enregistrement de ces fiches ? Vérifiez les sources officielles avant validation.'))return;const batch=pending.map(x=>({...x,status:'VALIDATED'}));if(token){try{for(const l of batch){const {localId,...body}=l;await api('/lessons',{method:'POST',body:JSON.stringify(body)})}alert('Fiches enregistrées sur le serveur.')}catch(e){alert('Serveur indisponible : fiches conservées localement. '+e.message);localLessons.push(...batch);localStorage.setItem('nz_local_lessons',JSON.stringify(localLessons))}}else{localLessons.push(...batch);localStorage.setItem('nz_local_lessons',JSON.stringify(localLessons));alert('Fiches enregistrées localement. Connectez-vous pour les synchroniser.')}pending=[];$('validate').disabled=true;await refreshLessons()};
async function refreshLessons(){let list=[...localLessons];if(token){try{list=[...await api('/lessons'),...list]}catch{}}$('lessonList').innerHTML=list.length?list.map((l,i)=>renderLesson(l,i)).join(''):'<p class="hint">Aucune fiche enregistrée.</p>'}
async function syncLocal(){if(!token||!navigator.onLine||!localLessons.length)return;let rest=[];for(const l of localLessons){try{let {localId,...body}=l;await api('/lessons',{method:'POST',body:JSON.stringify(body)})}catch{rest.push(l)}}localLessons=rest;localStorage.setItem('nz_local_lessons',JSON.stringify(rest));refreshLessons()}
function addBubble(t,who){let d=document.createElement('div');d.className='bubble '+who;d.textContent=t;$('chatlog').appendChild(d);$('chatlog').scrollTop=$('chatlog').scrollHeight}
$('ask').onclick=async()=>{let q=$('chatText').value.trim();if(!q)return;$('chatText').value='';addBubble(q,'user');if(!token){addBubble('Connectez-vous pour utiliser le tchat serveur.','bot');return}try{let r=await api('/chat',{method:'POST',body:JSON.stringify({messages:[{role:'user',content:q}]})});addBubble(r.answer,'bot')}catch{addBubble('Le service est indisponible.','bot')}};
$('login').onclick=async()=>{try{let r=await fetch(API+'/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:$('email').value,password:$('password').value})});let j=await r.json();if(!r.ok)throw Error(j.error);token=j.token;localStorage.setItem('nz_token',token);$('accountState').textContent='Connecté : '+j.user.email+' ('+j.user.role+')';$('adminPanel').hidden=j.user.role!=='ADMIN';await syncLocal();await loadDocs()}catch(e){$('accountState').textContent=e.message}};
$('logout').onclick=()=>{token='';localStorage.removeItem('nz_token');$('accountState').textContent='Déconnecté';$('adminPanel').hidden=true};
async function loadDocs(){try{let docs=await api('/documents');$('documents').innerHTML=docs.length?docs.map(d=>`<article class="lesson"><b>${esc(d.title)}</b><p>${esc(d.issuer||'Source non précisée')} • ${esc(d.discipline||'Toutes disciplines')} • ${esc(d.classLevel||'Toutes classes')}</p></article>`).join(''):'<p class="hint">Aucun document publié.</p>'}catch{$('documents').innerHTML='<p class="hint">Connectez-vous pour consulter les documents publiés.</p>'}}
$('uploadDoc').onclick=async()=>{let f=$('uploadFile').files[0];if(!f)return;let fd=new FormData();fd.append('file',f);fd.append('title',$('uploadTitle').value);fd.append('issuer',$('uploadIssuer').value);try{let r=await fetch(API+'/admin/documents',{method:'POST',headers:auth(),body:fd});let j=await r.json();if(!r.ok)throw Error(j.error);$('adminResult').textContent='Document ajouté, statut : en attente de vérification.'}catch(e){$('adminResult').textContent=e.message}};
$('print').onclick=()=>window.print();
function net(){ $('net').textContent=navigator.onLine?'En ligne':'Hors connexion';$('net').style.color=navigator.onLine?'#d8ffe7':'#fff0bd';if(navigator.onLine)syncLocal()}
window.addEventListener('online',net);window.addEventListener('offline',net);
if('serviceWorker'in navigator)navigator.serviceWorker.register('/sw.js').catch(()=>{});
initCatalog();refreshLessons();loadDocs();net();

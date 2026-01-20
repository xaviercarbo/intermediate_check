let historic = JSON.parse(localStorage.getItem("angles_historic")) || [];
let indexActual = parseInt(localStorage.getItem("angles_index_actual")) || 0;
let preguntesFiltrades = [];
let dadesReals = null;
let filtreTemporalActual = "all";

const estructuraTemes = [
  { titol: "Present and past", rang: [1, 6] },
  { titol: "Present perfect and past", rang: [7, 18] },
  { titol: "Future", rang: [19, 25] },
  { titol: "Modals", rang: [26, 37] },
  { titol: "if and wish", rang: [38, 41] },
  { titol: "Passive", rang: [42, 46] },
  { titol: "Reported speech", rang: [47, 48] },
  { titol: "Questions and auxiliary verbs", rang: [49, 52] },
  { titol: "-ing and to ...", rang: [53, 68] },
  { titol: "Articles and nouns", rang: [69, 81] },
  { titol: "Pronouns and determiners", rang: [82, 91] },
  { titol: "Relative clauses", rang: [92, 97] },
  { titol: "Adjectives and adverbs", rang: [98, 112] },
  { titol: "Conjunctions and prepositions", rang: [113, 120] },
  { titol: "Prepositions", rang: [121, 136] },
  { titol: "Phrasal verbs", rang: [137, 145] },
];

// 1. INICIALITZACIÓ SEGURA
function inicialitzarDades() {
  if (typeof dadesApp !== "undefined") dadesReals = dadesApp;
  else if (typeof dades !== "undefined") dadesReals = { issues: dades };

  if (!dadesReals) return;

  // Crear llista plana per navegació universal
  preguntesFiltrades = [];
  dadesReals.issues.forEach((issue) => {
    issue.preguntes.forEach((q) => {
      preguntesFiltrades.push({ ...q, issueTitol: issue.titol });
    });
  });

  // Forçar arrencada a la vista Study
  canviarVista("PRACTICE");
}

// 2. NAVEGACIÓ SENSE BLOQUEIG
function canviarVista(vista) {
  // Gestió visual de botons (IDs segons el teu HTML)
  document
    .querySelectorAll(".main-nav button")
    .forEach((b) => b.classList.remove("active"));

  const mapping = {
    PRACTICE: "nav-study",
    REVISION: "nav-revision",
    PROGRESS: "nav-stats",
  };
  const btnId = mapping[vista];
  if (document.getElementById(btnId))
    document.getElementById(btnId).classList.add("active");

  const quizCont = document.getElementById("quiz-container");
  const evolCont = document.getElementById("seccio-evolucio");

  if (vista === "PROGRESS") {
    quizCont.style.display = "none";
    evolCont.style.display = "block";
    generarInformeEvolucio();
  } else if (vista === "REVISION") {
    quizCont.style.display = "block";
    evolCont.style.display = "none";
    generarLlistaRevision();
  } else {
    quizCont.style.display = "block";
    evolCont.style.display = "none";
    dibuixarPregunta();
  }
}

// 3. RENDERITZACIÓ DE PREGUNTES
function dibuixarPregunta() {
  const container = document.getElementById("quiz-container");
  const q = preguntesFiltrades[indexActual];
  if (!q) return;

  const estat = obtenirEstatRepas(q.id);
  localStorage.setItem("angles_index_actual", indexActual);

  // Preparem els buits: si ja està feta avui, mostrem la resposta o un check
  const buits = q.solucions
    .map((s, i) => {
      const resp = estat.ultimaLletra ? estat.ultimaLletra.split(", ")[i] : "";
      const contingut = estat.fetaAvui ? resp || "✓" : "_______";
      return `<span class="drop-zone" id="drop-${q.id}-${i}" ondrop="drop(event)" ondragover="allowDrop(event)" onclick="netejarBuit(this)" data-value="${resp}">${contingut}</span>`;
    })
    .join(" and ");

  container.innerHTML = `
        <div class="header-pregunta">
            <span class="tag-issue">${q.issueTitol}</span>
            <span class="tag-counter">Ex. ${indexActual + 1} / ${preguntesFiltrades.length}</span>
        </div>
        <div class="question-block">
            <p class="main-sentence">
                <span class="exercise-number">${q.id}</span> ${q.text_pre} ${buits} ${q.text_post}
            </p>
            
            <div class="options-container">
                ${q.opcions.map((opt) => `<div class="option" draggable="true" ondragstart="drag(event)">${opt}</div>`).join("")}
            </div>

            <div id="feedback-area">
                ${estat.fetaAvui ? `<div class="msg-info">This activity is completed. Review available in ${estat.diesRestants} days.</div>` : ""}
            </div>

            <div class="controls-row">
                <button class="control-btn secondary" onclick="canviarPregunta(-1)" ${indexActual === 0 ? "disabled" : ""}>Previous</button>
                <button class="control-btn primary" id="btn-validar" onclick="validar('${q.id}')" ${estat.fetaAvui ? 'disabled style="background:#ccc"' : ""}>Check Answer</button>
                <button class="control-btn secondary" onclick="canviarPregunta(1)" ${indexActual === preguntesFiltrades.length - 1 ? "disabled" : ""}>Next</button>
            </div>
        </div>`;
}

// 4. VALIDACIÓ I REVISIÓ
function validar(id) {
  const q = preguntesFiltrades[indexActual];
  const zones = document.querySelectorAll(`[id^="drop-${id}-"]`);
  const respostesUsuari = Array.from(zones).map((z) =>
    z.dataset.value ? z.dataset.value.trim() : "",
  );

  if (respostesUsuari.includes("")) {
    alert("Please complete the gaps!");
    return;
  }

  const esCorrecte =
    respostesUsuari.length === q.solucions.length &&
    respostesUsuari.every((val) => q.solucions.includes(val));

  const feedbackArea = document.getElementById("feedback-area");

  if (esCorrecte) {
    showSuccessAnimation();
    feedbackArea.innerHTML = `<div class="msg-ok">✅ Good Job! Well done.</div>`;
  } else {
    feedbackArea.innerHTML = `
            <div class="msg-error">
                ❌ Correct: <strong>${q.solucions.join(" and ")}</strong>.<br>
                <small>Scheduled for review in 2 days.</small>
            </div>`;
  }

  historic.push({
    id,
    issue: q.issueTitol,
    correcte: esCorrecte,
    lletra: respostesUsuari.join(", "),
    data: new Date().toISOString(),
    unitats: q.unitats,
  });
  localStorage.setItem("angles_historic", JSON.stringify(historic));

  if (esCorrecte) setTimeout(() => canviarPregunta(1), 2000);
}

// 5. REVISION I PROGRESS (MILLORATS)
function generarLlistaRevision() {
  const container = document.getElementById("quiz-container");
  let pendents = [];
  const avui = new Date();
  avui.setHours(0, 0, 0, 0);

  preguntesFiltrades.forEach((q) => {
    const estat = obtenirEstatRepas(q.id);
    if (estat.teHistoric) {
      const diff = Math.ceil(
        (estat.dataProximRepas - avui) / (1000 * 60 * 60 * 24),
      );
      let mostrar =
        filtreTemporalActual === "all" ||
        (filtreTemporalActual === "today" && diff <= 0) ||
        (filtreTemporalActual === "week" && diff <= 7);
      if (mostrar) pendents.push({ ...q, estat, diff });
    }
  });

  container.innerHTML = `
        <div class="question-block">
            <h3 style="color:#2596be">Revision Planner</h3>
            <div style="margin-bottom:15px; display:flex; gap:10px;">
                <button class="filter-btn ${filtreTemporalActual === "today" ? "active" : ""}" onclick="setFiltreTemporal('today')">Today</button>
                <button class="filter-btn ${filtreTemporalActual === "all" ? "active" : ""}" onclick="setFiltreTemporal('all')">All</button>
            </div>
            <table style="width:100%; border-collapse:collapse;">
                ${
                  pendents
                    .map(
                      (p) => `
                    <tr style="border-bottom:1px solid #eee;">
                        <td style="padding:12px;"><strong>${p.id}</strong> - ${p.issueTitol}</td>
                        <td style="color:${p.diff <= 0 ? "#e67e22" : "#27ae60"}">${p.diff <= 0 ? "Due now" : "in " + p.diff + "d"}</td>
                        <td style="text-align:right;"><button class="control-btn primary" style="padding:5px 12px; font-size:0.8rem;" onclick="anarAPreguntaDirecta('${p.id}')">Start</button></td>
                    </tr>
                `,
                    )
                    .join("") ||
                  '<tr><td colspan="3" style="text-align:center; padding:30px; color:#999;">No activities to review.</td></tr>'
                }
            </table>
        </div>`;
}

// Funció per calcular l'estat global i per unitat
function generarInformeEvolucio() {
  const container = document.getElementById("stats-resum");
  const totalActivitatsGlobals = 161;
  const correctesUniques = new Set(
    historic.filter((h) => h.correcte).map((h) => h.id),
  ).size;
  const percentGlobal = Math.round(
    (correctesUniques / totalActivitatsGlobals) * 100,
  );

  let html = `
        <div class="stats-header-minimal">
            <div style="font-size:3rem; color:#2596be; font-weight:bold;">${percentGlobal}%</div>
            <div style="text-align:left">
                <div style="font-weight:bold; color:#444">Global Mastery</div>
                <div style="font-size:0.8rem; color:#888">${correctesUniques} of ${totalActivitatsGlobals} activities done</div>
            </div>
        </div>
        <div class="themes-container">`;

  estructuraTemes.forEach((tema) => {
    // Filtrem quines unitats del diccionari cauen dins d'aquest tema
    const unitatsDelTema = Object.keys(diccionariUnitats)
      .map(Number)
      .filter((u) => u >= tema.rang[0] && u <= tema.rang[1]);

    let counts = { mastered: [], review: [], pending: [] };
    let encertsTema = 0;
    let totalTema = 0;

    unitatsDelTema.forEach((u) => {
      // Busquem si hi ha activitats d'aquesta unitat a l'històric
      const activitatsUnitat = historic.filter(
        (h) => h.unitats && h.unitats.includes(u),
      );
      const nomU = diccionariUnitats[u];

      if (activitatsUnitat.length === 0) {
        counts.pending.push({ id: u, nom: nomU });
      } else {
        const ultim = activitatsUnitat[activitatsUnitat.length - 1];
        if (ultim.correcte) {
          counts.mastered.push({ id: u, nom: nomU });
          encertsTema++;
        } else {
          counts.review.push({ id: u, nom: nomU });
        }
      }
      totalTema++;
    });

    const percTema = Math.round((counts.mastered.length / totalTema) * 100);

    html += `
            <div class="theme-card">
                <div class="theme-trigger" onclick="this.nextElementSibling.classList.toggle('hidden')">
                    <div class="theme-title-row">
                        <span class="theme-name">${tema.titol}</span>
                        <span class="theme-badge">${percTema}%</span>
                    </div>
                    <div class="theme-bar"><div style="width:${percTema}%"></div></div>
                </div>
                <div class="theme-content hidden">
                    ${renderGrupUnitats("📖 TO IMPROVE", counts.review, "orange")}
                    ${renderGrupUnitats("⏳ PENDING", counts.pending, "grey")}
                    ${renderGrupUnitats("🏅 MASTERED", counts.mastered, "blue")}
                </div>
            </div>`;
  });

  container.innerHTML = html + `</div>`;
}

function renderGrupUnitats(titol, llista, color) {
  if (llista.length === 0) return "";
  return `
        <div class="unit-group-title ${color}">${titol}</div>
        <div class="unit-items-grid">
            ${llista.map((u) => `<div class="unit-tag">${u.id} <small>${u.nom}</small></div>`).join("")}
        </div>`;
}
// 6. FUNCIONS AUXILIARS
function obtenirEstatRepas(id) {
  const r = historic.filter((h) => h.id === id);
  if (r.length === 0) return { teHistoric: false, fetaAvui: false };
  const ultim = r[r.length - 1];
  const dataU = new Date(ultim.data);
  const interval = ultim.correcte ? 7 : 2;
  const proxim = new Date(dataU);
  proxim.setDate(dataU.getDate() + interval);
  const avui = new Date();
  const diff = Math.ceil((proxim - avui) / (1000 * 60 * 60 * 24));
  return {
    teHistoric: true,
    fetaAvui: dataU.toLocaleDateString() === avui.toLocaleDateString(),
    diesRestants: Math.max(0, diff),
    dataProximRepas: proxim,
    ultimaLletra: ultim.lletra,
  };
}

function setFiltreTemporal(f) {
  filtreTemporalActual = f;
  generarLlistaRevision();
}
function anarAPreguntaDirecta(id) {
  indexActual = preguntesFiltrades.findIndex((q) => q.id === id);
  canviarVista("PRACTICE");
}
function canviarPregunta(d) {
  indexActual = Math.max(
    0,
    Math.min(preguntesFiltrades.length - 1, indexActual + d),
  );
  dibuixarPregunta();
}
function allowDrop(ev) {
  ev.preventDefault();
}
function drag(ev) {
  ev.dataTransfer.setData("text", ev.target.innerText);
}
function drop(ev) {
  ev.preventDefault();
  const txt = ev.dataTransfer.getData("text").split(" ")[0];
  ev.target.innerText = txt;
  ev.target.dataset.value = txt;
  ev.target.style.background = "#e1f5fe";
  ev.target.style.borderBottom = "2px solid #2596be";
}
function netejarBuit(el) {
  el.innerText = "_______";
  el.dataset.value = "";
  el.style.background = "transparent";
}
function showSuccessAnimation() {
  const div = document.createElement("div");
  div.className = "feedback-overlay";
  div.innerHTML = `<div class="medal-card">🏅<br>GOOD JOB!</div>`;
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 1500);
}
function netejarHistoric() {
  if (confirm("This will erase ALL progress. Continue?")) {
    localStorage.clear();
    location.reload();
  }
}

window.onload = inicialitzarDades;

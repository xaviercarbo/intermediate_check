let nivellActual =
  localStorage.getItem("angles_nivell_actiu") || "intermediate";
let historic =
  JSON.parse(localStorage.getItem(`historic_${nivellActual}`)) || [];
let indexActual = parseInt(localStorage.getItem(`index_${nivellActual}`)) || 0;
let preguntesFiltrades = [];
let diccionariUnitats = null; // Ara és un contenidor buit que omplirem
let estructuraTemesActual = []; // Ara és un contenidor buit que omplirem
let dadesReals = null; // Ara és un contenidor buit que omplirem
let filtreTemporalActual = "all";

// 2. CONFIGURACIÓ PER NIVELLS (Dades, Diccionaris i Rangs)
const configuracioNivells = {
  basic: {
    dades: typeof dades_basic !== "undefined" ? dades_basic : null,
    diccionari:
      typeof diccionariUnitats_basic !== "undefined"
        ? diccionariUnitats_basic
        : null,
    temes: [
      { titol: "Present", rang: [1, 9] },
      { titol: "Past", rang: [10, 15] },
      { titol: "Present Perfect", rang: [16, 19] },
      { titol: "Passive", rang: [20, 21] },
      { titol: "Verbs Forms", rang: [22, 23] },
      { titol: "Future", rang: [24, 26] },
      { titol: "Modals, imperative, etc.", rang: [27, 34] },
      { titol: "There and it", rang: [35, 37] },
      { titol: "Auxiliar Verbs", rang: [38, 41] },
      { titol: "Questions", rang: [42, 47] },
      { titol: "Reported Speech", rang: [48, 48] },
      { titol: "-ing and do", rang: [49, 52] },
      { titol: "get, do, make, and have", rang: [53, 56] },
      { titol: "Pronouns and possessives", rang: [57, 62] },
      { titol: "A and the", rang: [63, 71] },
      { titol: "Determiners and pronouns", rang: [72, 82] },
      { titol: "Adjectives and adverbs", rang: [83, 90] },
      { titol: "Word order", rang: [91, 94] },
      { titol: "Conjunctions and clauses", rang: [95, 96] },
      { titol: "Prepositions", rang: [101, 111] },
      { titol: "Phrasal verbs", rang: [112, 113] },
      // ... afegeix aquí els rangs segons el llibre Basic
    ],
  },
  essential: {
    dades: typeof dades_essencial !== "undefined" ? dades_essencial : null,
    diccionari:
      typeof diccionariUnitats_essencial !== "undefined"
        ? diccionariUnitats_essencial
        : null,
    temes: [
      { titol: "Present", rang: [1, 9] },
      { titol: "Past", rang: [10, 14] },
      { titol: "Present Perfect", rang: [15, 20] },
      { titol: "Passive", rang: [21, 22] },
      { titol: "Verb forms", rang: [23, 24] },
      { titol: "Future", rang: [25, 28] },
      { titol: "Modals, imperative...etc.", rang: [29, 36] },
      { titol: "There and it", rang: [37, 39] },
      { titol: "Auxiliary verbs", rang: [40, 43] },
      { titol: "Questions", rang: [44, 49] },
      { titol: "Reported speech", rang: [50, 50] },
      { titol: "-ing and to...", rang: [51, 54] },
      { titol: "Go, get, do, make and have", rang: [55, 58] },
      { titol: "Pronouns and possessives", rang: [59, 64] },
      { titol: "A and the", rang: [65, 73] },
      { titol: "Determiners and pronouns", rang: [74, 84] },
      { titol: "Adjectives and adverbs", rang: [85, 92] },
      { titol: "Word order", rang: [93, 96] },
      { titol: "Conjunctions and clauses", rang: [97, 102] },
      { titol: "Prepositions", rang: [103, 113] },
      { titol: "Phrasal verbs", rang: [114, 115] },
      // ... afegeix aquí els rangs segons el llibre Essential
    ],
  },
  intermediate: {
    dades: typeof dadesApp !== "undefined" ? dadesApp : null,
    diccionari:
      typeof diccionariUnitats_intermediate !== "undefined"
        ? diccionariUnitats_intermediate
        : typeof diccionariUnitats !== "undefined"
          ? diccionariUnitats
          : null,
    temes: [
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
    ],
  },
};

// 1. INICIALITZACIÓ SEGURA
function inicialitzarDades() {
  const config = configuracioNivells[nivellActual];

  if (!config || !config.dades) {
    console.error(
      "No s'han pogut carregar les dades pel nivell:",
      nivellActual,
    );
    // Si falla, intentem tornar a l'intermediate per seguretat
    if (nivellActual !== "intermediate") {
      nivellActual = "intermediate";
      inicialitzarDades();
    }
    return;
  }

  // Assignem les dades del nivell a les variables de treball (let)
  dadesReals = config.dades;
  diccionariUnitats = config.diccionari;
  estructuraTemesActual = config.temes;

  actualitzarBotonsNivell();

  // Preparem la llista de preguntes
  preguntesFiltrades = [];
  dadesReals.issues.forEach((issue) => {
    issue.preguntes.forEach((q) => {
      preguntesFiltrades.push({ ...q, issueTitol: issue.titol });
    });
  });

  canviarVista("PRACTICE");
}
// Funció nova per gestionar el canvi
function canviarNivell(nouNivell) {
  if (nivellActual === nouNivell) return;
  localStorage.setItem("angles_nivell_actiu", nouNivell);
  location.reload(); // Recarreguem per aplicar els canvis de dades
}

function actualitzarBotonsNivell() {
  document.querySelectorAll(".lvl-btn").forEach((btn) => {
    btn.classList.remove("active");
    if (btn.id === `btn-${nivellActual}`) btn.classList.add("active");
  });
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
  localStorage.setItem(`index_${nivellActual}`, indexActual);

  // 1. LÒGICA DE TEXT PER UNITATS (Ex: U1: am/is/are)
  const llistaUnitats = q.unitats || [];
  const textUnitats = llistaUnitats
    .map((u) => {
      const nom =
        diccionariUnitats && diccionariUnitats[u]
          ? diccionariUnitats[u]
          : "Unit " + u;
      return `U${u}: ${nom}`;
    })
    .join(" | ");

  // 2. DASHBOARD DE SÈSSIO (Càlcul de marcadors)
  let fetesAvui = 0,
    correctes = 0,
    aMillorar = 0;
  preguntesFiltrades.forEach((preg) => {
    const e = obtenirEstatRepas(preg.id);
    if (e.fetaAvui) fetesAvui++;
    const h = historic.filter((i) => i.id === preg.id);
    if (h.length > 0) {
      if (h[h.length - 1].correcte) correctes++;
      else aMillorar++;
    }
  });
  const pendents = preguntesFiltrades.length - fetesAvui;

  // Preparem els buits
  const buits = q.solucions
    .map((s, i) => {
      const resp = estat.ultimaLletra ? estat.ultimaLletra.split(", ")[i] : "";
      const contingut = estat.fetaAvui ? resp || "✓" : "_______";
      return `<span class="drop-zone" id="drop-${q.id}-${i}" ondrop="drop(event)" ondragover="allowDrop(event)" onclick="netejarBuit(this)" data-value="${resp}">${contingut}</span>`;
    })
    .join(" / ");

  container.innerHTML = `
        <div class="breadcrumb-info">
            <span class="badge-nivell badge-${nivellActual}">${nivellActual.toUpperCase()}</span>
            <span class="text-tema-unitat">
                <strong>${q.issueTitol}:</strong> ${textUnitats}
            </span>
        </div>

        <div class="session-dashboard">
            <div class="stat-pill neutral"><b>${pendents}</b> Pending</div>
            <div class="stat-pill today"><b>${fetesAvui}</b> Done today</div>
            <div class="stat-pill success"><b>${correctes}</b> Passed</div>
            <div class="stat-pill fail"><b>${aMillorar}</b> To review</div>
        </div>

        <div class="header-pregunta" style="display: flex; justify-content: flex-end;">
            <span class="tag-counter">Ex. ${indexActual + 1} / ${preguntesFiltrades.length}</span>
        </div>
        
        <div class="question-block">
            <p class="main-sentence">
                <span class="exercise-number">${q.id}</span> 
                ${q.text_pre} ${buits} ${q.text_post}
            </p>
            
            ${q.solucions.length > 1 ? `<div class="multi-answer-notice">💡 Note: This sentence has ${q.solucions.length} correct options.</div>` : ""}
            
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
  localStorage.setItem(`historic_${nivellActual}`, JSON.stringify(historic));

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

  estructuraTemesActual.forEach((tema) => {
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
  }); // <--- AQUÍ ACABA EL BUCLE
  // 3. TANQUEM EL CONTENIDOR I AFEGIM EL BOTÓ (FORA DEL BUCLE)
  html += `</div> 
        <div style="margin-top: 40px; padding: 20px; border-top: 1px solid #eee; text-align: center;">
            <p style="color: #999; font-size: 0.75rem; margin-bottom: 10px;">
                Warning: This will permanently erase all your progress and study history.
            </p>
            <button onclick="netejarHistoric()" class="btn-reset-danger">
                Reset All Progress History
            </button>
        </div>`;
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

function netejarHistoric() {
  const confirmacio = confirm(
    "Are you sure you want to delete ALL your progress for " +
      nivellActual.toUpperCase() +
      "? This action cannot be undone.",
  );

  if (confirmacio) {
    // 1. Borrem les claus específiques d'aquest nivell al navegador
    localStorage.removeItem(`historic_${nivellActual}`);
    localStorage.removeItem(`index_${nivellActual}`);

    // 2. REINICIEM LES VARIABLES EN MEMÒRIA (L'estat actual de l'App)
    historic = [];
    indexActual = 0;

    // 3. RE-INICIALITZEM LES DADES (Això netejarà el Dashboard i les preguntes)
    inicialitzarDades();

    alert(
      "Progress for " +
        nivellActual.toUpperCase() +
        " has been reset successfully.",
    );

    // Opcional: Si vols una neteja total de la pantalla
    canviarVista("PRACTICE");
  }
}

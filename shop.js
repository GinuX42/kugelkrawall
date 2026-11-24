"use strict";

const byId = (id) => document.getElementById(id);
const values = { sql: 50, sqlfix: 25, xss: 50, xssfix: 25, case: 50 };
const maximum = Object.values(values).reduce((sum, value) => sum + value, 0);
const repairs = {
  sqlfix: { puzzle: "sql", choice: "parameter", input: "search" },
  xssfix: { puzzle: "xss", choice: "text", input: "entry" }
};
const keys = ["sql", "xss", "case", ...Object.keys(repairs).flatMap(id =>
  ["active", "command", "normal"].map(step => id + "-" + step))];
const prefix = "kugelkrawall.spiel.v1.";
const solved = new Set();
const cards = Array.from(document.querySelectorAll(".flavour"));
const normalize = (value) => value.trim().normalize("NFKC").toLocaleUpperCase("de-DE");
const defaultBoard = "Heute frisch gerührt!";
let canSave = true;
let activeSearch = "";

function syncProgress() {
  if (!canSave) return;
  try {
    const saved = keys.filter(key => localStorage.getItem(prefix + key) === "1");
    solved.clear();
    for (const key of saved) solved.add(key);
  } catch {
    canSave = false;
  }
}

function remember(key) {
  solved.add(key);
  if (!canSave) return;
  try {
    localStorage.setItem(prefix + key, "1");
  } catch {
    canSave = false;
  }
}

function complete(id) {
  if (!repairs[id]) return solved.has(id);
  return ["active", "command", "normal"].every(step => solved.has(id + "-" + step));
}

function showProgress() {
  let points = 0;
  for (const [id, value] of Object.entries(values)) {
    const done = complete(id);
    if (done) points += value;
    byId(id + "-score").textContent = (done ? value : 0) + " / " + value;
    byId(id + "-chip").textContent = (done ? "Gelöst · " : "") + value + " Pkt.";
    byId(id + "-chip").classList.toggle("done", done);
    byId(id + "-lesson").hidden = !done;
  }
  for (const [id, repair] of Object.entries(repairs)) {
    const unlocked = solved.has(repair.puzzle);
    byId(id + "-locked").hidden = unlocked;
    byId(id + "-controls").hidden = !unlocked;
    byId(id + "-form").hidden = solved.has(id + "-active");
    for (const step of ["command", "normal"]) {
      byId(id + "-" + step).textContent = solved.has(id + "-" + step) ? "bestanden" : "offen";
    }
  }
  byId("total").textContent = points;
  byId("header-score").textContent = points + " / " + maximum + " Pkt.";
  byId("progress-copy").textContent = points === maximum ? "Alle fünf Aufgaben gelöst!" :
    points === 0 ? "Beginnen Sie mit der Sortensuche." : "Folgen Sie den offenen Aufgaben. Jede Lösung zählt einmal.";
  if (!canSave) byId("storage-note").textContent = "Der Browserspeicher ist gesperrt. Die Punkte gelten für diese geöffnete Seite.";
}

function award(id) {
  if (solved.has(id)) return "Diese " + values[id] + " Punkte haben Sie bereits erhalten.";
  remember(id);
  showProgress();
  return "Dafür erhalten Sie " + values[id] + " Punkte!";
}

function checkRepair(id, step) {
  if (!step || solved.has(id + "-" + step)) return "";
  remember(id + "-" + step);
  showProgress();
  return complete(id) ? " Beide Tests bestanden. Sie erhalten 25 Punkte für die Reparatur!" :
    " Ein Test bestanden. Führen Sie jetzt den zweiten Test aus.";
}

function activateRepair(id) {
  const repair = repairs[id];
  if (!solved.has(repair.puzzle) || solved.has(id + "-active")) return;
  if (byId(id + "-choice").value !== repair.choice) {
    byId(id + "-feedback").textContent = id === "sqlfix"
      ? "Diese Wahl trennt Suchwert und Anweisung nicht. Wählen Sie eine andere Maßnahme."
      : "Diese Wahl verhindert die Steuerung der Tafel nicht. Wählen Sie eine andere Maßnahme.";
    return;
  }
  remember(id + "-active");
  byId(id + "-feedback").textContent = "Schutz aktiv. Führen Sie jetzt die beiden Tests aus.";
  if (id === "sqlfix") {
    activeSearch = "";
    byId("search").value = "";
    filterCards("", false);
    byId("search-result").textContent = "Schutz aktiv. Testen Sie zuerst Ihren Bon für Theke und Lager und dann Mango.";
  } else {
    updateBoard(defaultBoard);
    byId("entry").value = "";
    byId("guest-result").textContent = "Schutz aktiv. Testen Sie zuerst Ihren KIRSCHALARM-Stempel und dann den normalen Kommentar.";
  }
  showProgress();
  byId(repair.input).focus();
}

// Spielbefehle sind feste Muster. Die Suche arbeitet nur mit den vorbereiteten Sortenkarten.
function readSearch(value) {
  const term = normalize(value);
  const command = /^KARTE\s*\[\s*(THEKE|LAGER)\s*(?:\+\s*(THEKE|LAGER)\s*)?\]$/.exec(term);
  if (!command) return { term, kind: "text" };
  if (command[2] && command[1] !== command[2]) return { term: "", kind: "all" };
  return { term: "", kind: command[1] === "THEKE" ? "counter" : "store" };
}

function filterCards(term, includeSecret) {
  const hits = [];
  for (const card of cards) {
    const searchable = normalize(card.dataset.name + " " + card.dataset.ingredients);
    const matches = (card.id !== "secret" || includeSecret) && searchable.includes(term);
    card.hidden = !matches;
    if (matches) hits.push(card.dataset.name);
  }
  byId("empty-menu").hidden = hits.length > 0;
  return hits;
}

function search(value) {
  activeSearch = value;
  const request = readSearch(value);
  const result = byId("search-result");
  if (solved.has("sqlfix-active")) {
    const hits = filterCards(normalize(value), false);
    result.textContent = (hits.length ? hits.length + " Treffer: " + hits.join(", ") + "." : "Kein Treffer. Das Lager bleibt verborgen.")
      + checkRepair("sqlfix", request.kind === "all" ? "command" : normalize(value) === "MANGO" ? "normal" : null);
    return;
  }
  if (request.kind === "all") {
    const message = award("sql");
    filterCards("", true);
    result.textContent = "Vier Treffer! Im Lager liegt Mitternachtslakritz mit Brombeere und Meersalz. " + message;
    return;
  }
  if (request.kind === "store") {
    filterCards("", false);
    result.textContent = "Das Lager allein ist gesperrt. Können Sie beide Bereiche auf einen Bon setzen?";
    return;
  }
  const hits = filterCards(request.term, solved.has("sql") && request.kind === "text");
  if (!hits.length) {
    result.textContent = "Kein Treffer. Prüfen Sie den Suchbegriff oder lesen Sie den Bon aus der Eisküche.";
  } else {
    result.textContent = hits.length + " Treffer: " + hits.join(", ") + ".";
  }
}

function updateBoard(message) {
  byId("board").textContent = message;
  byId("board").parentElement.classList.toggle("alarm", message === "KIRSCHALARM");
}

function postEntry(value) {
  const entry = value.trim();
  const result = byId("guest-result");
  if (!entry) {
    result.textContent = "Bitte schreiben Sie zuerst einen Eintrag.";
    return;
  }
  byId("last-entry").textContent = entry;
  if (solved.has("xssfix-active")) {
    const alarm = /^\[TAFEL\]\s*KIRSCHALARM\s*\[\/TAFEL\]$/iu.test(entry);
    const normal = normalize(entry).replace(/[.!?]$/, "") === "DIE MINZE SCHMECKT FRISCH";
    result.textContent = "Ihr Eintrag steht als Text unter „Letzter Eintrag“. Die Eistafel zeigt weiterhin „" + byId("board").textContent + "“."
      + checkRepair("xssfix", alarm ? "command" : normal ? "normal" : null);
    return;
  }
  const stamp = /^\[TAFEL\]\s*([\p{L}\p{N} !?.,-]{1,60}?)\s*\[\/TAFEL\]$/iu.exec(entry);
  if (!stamp) {
    result.textContent = "Ihr Eintrag erscheint als Text im Gästebuch. Die Tafel zeigt weiterhin „" + byId("board").textContent + "“.";
    return;
  }
  const message = normalize(stamp[1]);
  if (!message) {
    result.textContent = "Zwischen den Tafelmarken fehlt eine Meldung.";
    return;
  }
  updateBoard(message);
  if (message === "KIRSCHALARM") {
    result.textContent = "Die Eistafel meldet KIRSCHALARM. " + award("xss");
  } else {
    result.textContent = "Der Stempel funktioniert. Welche Meldung verlangt der Auftrag?";
  }
}

function resetRound() {
  try {
    for (const key of keys) localStorage.removeItem(prefix + key);
  } catch {
    canSave = false;
  }
  solved.clear();
  activeSearch = "";
  for (const id of [...Object.keys(repairs), "case"]) {
    byId(id + "-form").reset();
    byId(id + "-feedback").textContent = "";
  }
  byId("search-form").reset();
  byId("guest-form").reset();
  byId("search-result").textContent = "Die Kasse durchsucht die drei Sorten in der Theke.";
  byId("guest-result").textContent = "";
  byId("last-entry").textContent = "Das Gästebuch ist noch leer.";
  for (const hint of document.querySelectorAll("details[open]")) hint.open = false;
  filterCards("", false);
  updateBoard("Heute frisch gerührt!");
  showProgress();
}

byId("search-form").addEventListener("submit", (event) => {
  event.preventDefault();
  search(byId("search").value);
});
byId("guest-form").addEventListener("submit", (event) => {
  event.preventDefault();
  postEntry(byId("entry").value);
});
const resetDialog = byId("reset-dialog");
byId("reset-button").addEventListener("click", () => {
  resetDialog.returnValue = "cancel";
  resetDialog.showModal();
});
resetDialog.addEventListener("close", () => {
  if (resetDialog.returnValue === "reset") resetRound();
});
for (const id of Object.keys(repairs)) {
  byId(id + "-form").addEventListener("submit", event => {
    event.preventDefault();
    activateRepair(id);
  });
}

byId("case-form").addEventListener("submit", event => {
  event.preventDefault();
  const entry = byId("case-entry").value;
  const time = byId("case-time").value;
  const reason = byId("case-reason").value;
  const feedback = byId("case-feedback");
  if (time !== "14:08") {
    feedback.textContent = "Lesen Sie die Uhrzeit direkt über dem zweiten Tafelbild auf Rollenkarte B.";
  } else if (entry !== "3") {
    feedback.textContent = "Prüfen Sie, welcher Eintrag vor dem zweiten Bild lag und den passenden Text zwischen zwei Tafelmarken enthielt.";
  } else if (reason !== "match") {
    feedback.textContent = "Welche Begründung berücksichtigt sowohl die Uhrzeit als auch die Wirkung eines Tafelstempels?";
  } else {
    feedback.textContent = "Ihr Fallbericht stimmt. " + award("case");
  }
});

function restoreStationViews() {
  const protectedSearch = solved.has("sqlfix-active");
  const query = readSearch(activeSearch);
  const hits = filterCards(protectedSearch ? normalize(activeSearch) : query.term,
    !protectedSearch && solved.has("sql") && !["counter", "store"].includes(query.kind));
  if (protectedSearch) {
    byId("sqlfix-feedback").textContent = "Schutz aktiv. Ihren Teststand sehen Sie unter der Reparaturaufgabe.";
    byId("search-result").textContent = "Schutz aktiv. Treffer in der Theke: " + hits.length + ".";
  } else {
    byId("sqlfix-feedback").textContent = "";
    byId("search-result").textContent = activeSearch ? hits.length + " Treffer in der Eiskarte." :
      solved.has("sql") ? "Ihre Geheimsorte steht mit den drei Thekensorten in der Eiskarte." : "Die Kasse durchsucht die drei Sorten in der Theke.";
  }
  const protectedBoard = solved.has("xssfix-active");
  byId("xssfix-feedback").textContent = protectedBoard ? "Schutz aktiv. Die Eistafel bleibt beim Schreiben unverändert." : "";
  updateBoard(solved.has("xss") && !protectedBoard ? "KIRSCHALARM" : defaultBoard);
}

window.addEventListener("storage", event => {
  if (event.key !== null && !keys.some(key => event.key === prefix + key)) return;
  syncProgress();
  showProgress();
  restoreStationViews();
  if (!solved.size) {
    byId("case-feedback").textContent = "";
    byId("last-entry").textContent = "Das Gästebuch ist noch leer.";
    byId("guest-result").textContent = "";
  }
});
syncProgress();
showProgress();
restoreStationViews();

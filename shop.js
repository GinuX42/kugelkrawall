"use strict";

const byId = (id) => document.getElementById(id);
const missions = ["sql", "xss"];
const prefix = "kugelkrawall.spiel.v1.";
const solved = new Set();
const cards = Array.from(document.querySelectorAll(".flavour"));
const normalize = (value) => value.trim().normalize("NFKC").toLocaleUpperCase("de-DE");
let canSave = true;
let activeSearch = "";

function syncProgress() {
  try {
    for (const mission of missions) {
      if (localStorage.getItem(prefix + mission) === "1") solved.add(mission);
      else solved.delete(mission);
    }
  } catch {
    canSave = false;
  }
}

function showProgress() {
  const points = solved.size * 50;
  byId("header-score").textContent = points + " / 100 Pkt.";
  byId("total").textContent = points;
  byId("progress-copy").textContent = [
    "Zwei Rätsel warten auf Sie.",
    "Ein Rätsel gelöst. Eine zweite Entdeckung bringt weitere 50 Punkte.",
    "Beide Rätsel gelöst! Sie haben die Geheimsorte entdeckt und die Eistafel übernommen."
  ][solved.size];
  for (const mission of missions) {
    const done = solved.has(mission);
    byId(mission + "-score").textContent = done ? "50 / 50" : "0 / 50";
    byId(mission + "-chip").textContent = done ? "Gelöst · 50 Pkt." : "50 Pkt.";
    byId(mission + "-chip").classList.toggle("done", done);
    byId(mission + "-lesson").hidden = !done;
  }
  if (!canSave) byId("storage-note").textContent = "Der Browserspeicher ist gesperrt. Die Punkte gelten für diese geöffnete Seite.";
}

function award(mission) {
  if (solved.has(mission)) return "Die 50 Punkte dafür stehen bereits auf Ihrem Konto.";
  solved.add(mission);
  try {
    localStorage.setItem(prefix + mission, "1");
  } catch {
    canSave = false;
  }
  showProgress();
  return "Dafür erhalten Sie 50 Punkte!";
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
    for (const mission of missions) localStorage.removeItem(prefix + mission);
  } catch {
    canSave = false;
  }
  solved.clear();
  activeSearch = "";
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
window.addEventListener("storage", (event) => {
  if (event.key !== null && !missions.some((mission) => event.key === prefix + mission)) return;
  syncProgress();
  showProgress();
  const query = readSearch(activeSearch);
  filterCards(query.term, solved.has("sql") && !["counter", "store"].includes(query.kind));
  updateBoard(solved.has("xss") ? "KIRSCHALARM" : "Heute frisch gerührt!");
});
syncProgress();
showProgress();
filterCards("", solved.has("sql"));
if (solved.has("sql")) byId("search-result").textContent = "Ihre Geheimsorte steht jetzt mit den drei Thekensorten in der Eiskarte.";
if (solved.has("xss")) updateBoard("KIRSCHALARM");

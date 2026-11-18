  // ------- Aperto / chiuso (ora italiana) -------
  const ORARI = { 0: [[8, 13]], 1: [], 2: [[8, 12.5], [15.5, 19.5]], 3: [[8, 12.5], [15.5, 19.5]], 4: [[8, 12.5], [15.5, 19.5]], 5: [[8, 12.5], [15.5, 19.5]], 6: [[8.5, 12.5], [15.5, 19]] };
  const GIORNI = ["domenica", "lunedì", "martedì", "mercoledì", "giovedì", "venerdì", "sabato"];
  const fmtOra = h => Math.floor(h) + ":" + (h % 1 ? "30" : "00");
  function oraRoma() {
    const p = Object.fromEntries(new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Rome", hour: "2-digit", minute: "2-digit", hour12: false, weekday: "short" }).formatToParts(new Date()).map(x => [x.type, x.value]));
    return { wd: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(p.weekday), h: (+p.hour % 24) + (+p.minute) / 60 };
  }
  function stato() {
    const t = oraRoma(), oggi = ORARI[t.wd];
    const aperto = oggi.find(([a, b]) => t.h >= a && t.h < b);
    const el = document.getElementById("stato-hero"), tx = document.getElementById("stato-testo");
    if (aperto) { el.classList.remove("chiuso"); tx.textContent = "Aperto ora · fino alle " + fmtOra(aperto[1]); }
    else {
      el.classList.add("chiuso");
      const dopo = oggi.find(([a]) => t.h < a);
      if (dopo) tx.textContent = "Chiuso ora · riapriamo alle " + fmtOra(dopo[0]);
      else {
        let k = 1; while (!ORARI[(t.wd + k) % 7].length) k++;
        const g = (t.wd + k) % 7;
        tx.textContent = "Chiuso ora · riapriamo " + (k === 1 ? "domani" : GIORNI[g]) + " alle " + fmtOra(ORARI[g][0][0]);
      }
    }
    document.querySelectorAll("#orari > div").forEach(r => r.classList.toggle("oggi", r.dataset.d.split(",").includes(String(t.wd))));
  }
  stato(); setInterval(stato, 60000);

  // ------- Menu a tendina (telefono) -------
  const burger = document.getElementById("burger"), nav = document.getElementById("nav");
  const setMenu = open => {
    nav.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", open);
    burger.setAttribute("aria-label", open ? "Chiudi il menu" : "Apri il menu");
  };
  burger.addEventListener("click", () => setMenu(!nav.classList.contains("open")));
  nav.addEventListener("click", e => { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") setMenu(false); });

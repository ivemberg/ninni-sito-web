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

  // ------- Ordine torta su WhatsApp (il messaggio lo invia il cliente) -------
  const ordina = document.getElementById("ordina-form"), avviso = document.getElementById("ordina-avviso");
  const dataRitiro = ordina.elements.data, testoAvviso = avviso.textContent;
  const giornoRoma = d => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Rome" }).format(d);
  dataRitiro.min = giornoRoma(new Date(Date.now() + 2 * 864e5));   // almeno 2 giorni prima
  const errore = msg => { avviso.textContent = msg; avviso.classList.add("errore"); };
  const ripristina = () => { avviso.textContent = testoAvviso; avviso.classList.remove("errore"); };
  ordina.addEventListener("input", ripristina);
  ordina.addEventListener("submit", e => {
    e.preventDefault();
    const f = ordina.elements, giorno = new Date(f.data.value + "T12:00");
    if (!f.nome.value.trim() || !f.data.value || !f.persone.value) return errore("Inserisci nome, data di ritiro e numero di persone.");
    if (f.data.value < dataRitiro.min) return errore("Le torte si ordinano almeno 2 giorni prima.");
    if (!ORARI[giorno.getDay()].length) return errore("Il " + GIORNI[giorno.getDay()] + " siamo chiusi: scegli un altro giorno.");
    const righe = [
      "Ciao Ninnì! Vorrei ordinare una torta.",
      "Nome: " + f.nome.value.trim(),
      "Ritiro: " + giorno.toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" }),
      "Persone: " + f.persone.value,
    ];
    if (f.gusto.value.trim()) righe.push("Gusto: " + f.gusto.value.trim());
    if (f.note.value.trim()) righe.push("Scritta o decorazione: " + f.note.value.trim());
    ripristina();
    // Stessa scheda, non popup: i browser interni di Instagram/Facebook e delle app QR bloccano window.open
    location.href = "https://wa.me/393534024974?text=" + encodeURIComponent(righe.join("\n"));
  });
  // Link diretto al modulo (es. dal QR in negozio): .../#ordina apre la tendina
  const apriDaLink = () => {
    if (location.hash !== "#ordina") return;
    ordina.closest("details").open = true;
    document.getElementById("ordina").scrollIntoView({ block: "start" });
  };
  apriDaLink(); addEventListener("hashchange", apriDaLink);

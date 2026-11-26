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
  // ------- Prenotazione panettoni su WhatsApp (voci e prezzi letti dal menu) -------
  const pan = document.getElementById("panettoni-form"), panAvviso = document.getElementById("panettoni-avviso");
  const panTesto = panAvviso.textContent, panTotale = document.getElementById("panettoni-totale");
  const euro = n => n.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
  const voci = [...document.querySelectorAll(".gruppo.feste .voce")].map(li => ({
    nome: li.querySelector(".nome").textContent,
    prezzo: parseFloat(li.querySelector(".pill").textContent.replace(",", ".")),
  }));
  document.getElementById("panettoni-qta").innerHTML = voci.map((v, i) =>
    `<label><span>${v.nome} <small>${euro(v.prezzo)}</small></span><input name="q${i}" type="number" min="0" max="20" inputmode="numeric" placeholder="0" aria-label="Quanti: ${v.nome}"></label>`).join("");
  const quanti = () => voci.map((v, i) => ({ ...v, n: Math.max(0, Math.floor(+pan.elements["q" + i].value || 0)) })).filter(v => v.n);
  const domani = giornoRoma(new Date(Date.now() + 864e5));
  pan.elements.data.min = domani > "2026-12-01" ? domani : "2026-12-01";   // in vendita dal 1° dicembre
  const panErrore = msg => { panAvviso.textContent = msg; panAvviso.classList.add("errore"); };
  pan.addEventListener("input", () => {
    panAvviso.textContent = panTesto; panAvviso.classList.remove("errore");
    panTotale.textContent = "Totale: " + euro(quanti().reduce((s, v) => s + v.n * v.prezzo, 0));
  });
  pan.addEventListener("submit", e => {
    e.preventDefault();
    const f = pan.elements, scelti = quanti(), giorno = new Date(f.data.value + "T12:00");
    if (!scelti.length) return panErrore("Scegli almeno un panettone o una veneziana.");
    if (!f.nome.value.trim() || !f.data.value) return panErrore("Inserisci nome e data di ritiro.");
    if (f.data.value < f.data.min) return panErrore(f.data.min === "2026-12-01" ? "Panettoni e veneziane sono in vendita dal 1° dicembre." : "Scegli una data da domani in poi.");
    if (!ORARI[giorno.getDay()].length) return panErrore("Il " + GIORNI[giorno.getDay()] + " siamo chiusi: scegli un altro giorno.");
    const righe = [
      "Ciao Ninnì! Vorrei prenotare:",
      ...scelti.map(v => v.n + " × " + v.nome),
      "Totale: " + euro(scelti.reduce((s, v) => s + v.n * v.prezzo, 0)),
      "Nome: " + f.nome.value.trim(),
      "Ritiro: " + giorno.toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" }),
    ];
    location.href = "https://wa.me/393534024974?text=" + encodeURIComponent(righe.join("\n"));
  });

  // Link diretto ai moduli (es. dal QR in negozio): .../#ordina o .../#panettoni apre la tendina
  const apriDaLink = () => {
    const id = { "#ordina": "ordina", "#panettoni": "panettoni" }[location.hash];
    if (!id) return;
    const blocco = document.getElementById(id);
    (blocco.matches("details") ? blocco : blocco.querySelector("details")).open = true;
    blocco.scrollIntoView({ block: "start" });
  };
  apriDaLink(); addEventListener("hashchange", apriDaLink);

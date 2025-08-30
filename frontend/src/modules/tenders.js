/**
 * @file Tender List page (mock): filters by sector, province, amount band,
 *       and search text. Later consumes /api/tenders and /api/tenders/:id.
 */

/**
  @param {Tender[]} 
 */
// Tender List (mock data for now). Later: fetch from /api/tenders
const MOCK = [
  {
    id: "1",
    title: "RFQ: Cleaning Services – Clinic A",
    entity: "City of Joburg",
    province: "Gauteng",
    sector: "Cleaning",
    category: "RFQ",
    amount_band: "<R200k",
    closing_date: "2025-09-01",
    posted_date: "2025-08-20",
    source_url: "#"
  },
  {
    id: "2",
    title: "RFP: Network Upgrade – District Offices",
    entity: "Magalies Water",
    province: "North West",
    sector: "ICT",
    category: "RFP",
    amount_band: "R200k–R1m",
    closing_date: "2025-09-05",
    posted_date: "2025-08-22",
    source_url: "#"
  },
  {
    id: "3",
    title: "RFQ: Security Guarding – Depot",
    entity: "Rustenburg LM",
    province: "North West",
    sector: "Security",
    category: "RFQ",
    amount_band: "<R200k",
    closing_date: "2025-08-30",
    posted_date: "2025-08-21",
    source_url: "#"
  },
  {
    id: "4",
    title: "RFP: Water Pipeline Rehabilitation",
    entity: "City of Cape Town",
    province: "Western Cape",
    sector: "Construction",
    category: "RFP",
    amount_band: ">R1m",
    closing_date: "2025-09-10",
    posted_date: "2025-08-19",
    source_url: "#"
  }
];

function badge(band) {
  const c = band.includes(">")
    ? "pill-fail"
    : band.includes("R200k–R1m") ? "pill-warn" : "pill-ok";
  return `<span class="pill ${c}">${band}</span>`;
}

function card(t) {
  return `
  <div class="item">
    <div>
      <b>${t.title}</b>
      <div class="muted">${t.entity} · ${t.province} · Closes ${t.closing_date}</div>
      <div class="muted small">Posted ${t.posted_date} · ${t.sector} · ${t.category}</div>
    </div>
    <div class="row">
      ${badge(t.amount_band)}
      <a class="btn ghost" href="${t.source_url}" target="_blank" rel="noopener">Source</a>
      <a class="btn" href="#/workspace">Use</a>
    </div>
  </div>`;
}

function renderList(rows) {
  const list = document.getElementById("tenderList");
  list.innerHTML =
    rows.map(card).join("") ||
    `<div class="muted">No tenders match your filters.</div>`;
}

export default {
  /**
   * Render tenders UI: filters + list container.
   * @return {string}
   */
  template() {
    return `
      <section>
        <div class="card">
          <div class="row between">
            <h3>Tenders</h3>
            <div class="row">
              <a class="chip" data-band="small">Small fish &lt; R200k</a>
              <a class="chip" data-band="mid">R200k–R1m</a>
              <a class="chip" data-band="big">Big fish &gt; R1m</a>
            </div>
          </div>
          <div class="row" style="margin-top:10px">
            <input class="input" id="q" placeholder="Search title or entity…" />
            <select class="input" id="sector">
              <option value="">All sectors</option>
              <option>Cleaning</option><option>Security</option><option>ICT</option><option>Construction</option><option>Professional Services</option>
            </select>
            <select class="input" id="province">
              <option value="">All provinces</option>
              <option>Gauteng</option><option>North West</option><option>Western Cape</option><option>Eastern Cape</option><option>Limpopo</option>
            </select>
            <select class="input" id="band">
              <option value="">Any amount</option>
              <option>&lt;R200k</option>
              <option>R200k–R1m</option>
              <option>&gt;R1m</option>
            </select>
            <a class="btn ghost" id="btnReset">Reset</a>
          </div>
          <div class="hr"></div>
          <div class="list" id="tenderList"></div>
        </div>
      </section>
    `;
  },

  /**
   * Wire filters and list rendering.
   * Later: replace mock array with fetch('/api/tenders?...').
   * @return {void}
   */
  onMount() {
    const els = {
      q: document.getElementById("q"),
      sector: document.getElementById("sector"),
      province: document.getElementById("province"),
      band: document.getElementById("band"),
      reset: document.getElementById("btnReset")
    };

    const apply = () => {
      const q = (els.q.value || "").toLowerCase();
      const s = els.sector.value;
      const p = els.province.value;
      const b = els.band.value;
      const rows = MOCK.filter(
        t =>
          (!q ||
            (t.title.toLowerCase().includes(q) ||
              t.entity.toLowerCase().includes(q))) &&
          (!s || t.sector === s) &&
          (!p || t.province === p) &&
          (!b || t.amount_band === b)
      ).sort((a, b) => a.closing_date.localeCompare(b.closing_date));
      renderList(rows);
    };

    ["input", "change"].forEach(ev => {
      els.q.addEventListener(ev, apply);
      els.sector.addEventListener(ev, apply);
      els.province.addEventListener(ev, apply);
      els.band.addEventListener(ev, apply);
    });

    document.querySelectorAll("[data-band]").forEach(chip => {
      chip.addEventListener("click", () => {
        const k = chip.getAttribute("data-band");
        els.band.value =
          k === "small" ? "<R200k" : k === "mid" ? "R200k–R1m" : ">R1m";
        apply();
      });
    });

    els.reset.addEventListener("click", () => {
      els.q.value = "";
      els.sector.value = "";
      els.province.value = "";
      els.band.value = "";
      renderList(MOCK);
    });

    // initial
    renderList(MOCK);
  }
};

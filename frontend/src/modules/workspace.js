/**
 * @file Workspace (private app area): upload RFQ/RFP, show checklist & progress,
 *       quick actions, and submission pack button (demo).
 *
 * Imports state; later will import compliance services.
 */


import { state } from '../utils/state.js';

/**
 * Build a checklist row for a given item.
 * @param {{key:string,label:string,done:boolean,note:string}} it
 * @return {string} HTML
 */
const row = (it) => {
  const badge = it.done ? '<span class="pill pill-ok">Completed</span>' :
                          '<span class="pill pill-fail">Missing</span>';
  const actions = it.done ? '<a class="btn ghost" href="#">Download</a>' :
                            `<a class="btn ghost" href="#">Template</a>
                             <button class="btn" data-mark="${it.key}">Upload</button>`;
  return `
    <div class="item ${it.done ? 'bg-ok' : 'bg-fail'}">
      <div><div><b>${it.label}</b></div><div class="muted">${it.note}</div></div>
      <div class="row">${actions}${badge}</div>
    </div>`;
};

/**
 * Compute progress percentage based on completed checklist items.
 * @return {number} 0–100
 */
const pct = () => Math.round((state.wsItems.filter(i => i.done).length / state.wsItems.length) * 100);

export default {

  /**
   * Render workspace page.
   * @return {string}
   */
  template() {
    return `
      <section>
        <div class="grid cols-3">
          <div class="card"><div class="kpi"><h3>Active Tenders</h3><span class="pill">3</span></div></div>
          <div class="card"><div class="kpi"><h3>Completed</h3><span class="pill">12</span></div></div>
          <div class="card"><div class="kpi"><h3>Needs Attention</h3><span class="pill">1</span></div></div>
        </div>

        <div class="grid cols-2" style="margin-top:16px">
          <div class="card">
            <h3>Upload New Tender Document</h3>
            <p class="muted">Drop your RFQ/RFP to start compliance checking</p>
            <div class="filebox">
              <div class="cloud">☁️</div>
              <div class="muted">Drop your PDF here</div>
              <label class="btn ghost" for="wsFile">Choose File</label>
              <input type="file" id="wsFile" hidden />
              <div class="muted small">Supported: PDF (max 10MB)</div>
            </div>
          </div>
          <div class="card">
            <h3>Quick Actions</h3>
            <div class="list">
              <div class="item"><div><b>Download SBD Templates</b><div class="muted">Standard bid forms</div></div><a class="btn ghost" href="#">Open</a></div>
              <div class="item"><div><b>Expert Consultation</b><div class="muted">We do it for you (from R3,000)</div></div><a class="btn" href="#/settings">Book</a></div>
              <div class="item"><div><b>Tender Guidelines</b><div class="muted">SA tender process</div></div><a class="btn ghost" href="#">View</a></div>
            </div>
          </div>
        </div>

        <div class="card" style="margin-top:16px">
          <div class="row between">
            <div>
              <h3 style="margin:0">City of Cape Town – Water Infrastructure RFP</h3>
              <div class="muted">Uploaded 2 days ago • Due: 15 Dec 2024</div>
            </div>
            <span class="pill">In Progress</span>
          </div>
          <div class="hr"></div>
          <div>
            <div class="muted">Compliance Score</div>
            <div class="progress"><div id="wsProgress" style="width:${pct()}%"></div></div>
            <div class="muted small">${pct()}% complete</div>
          </div>
        </div>

        <div class="grid cols-2" style="margin-top:16px">
          <div class="card">
            <h3>Document Checklist</h3>
            <div class="list" id="wsChecklist">${state.wsItems.map(row).join('')}</div>
            <div style="margin-top:12px">
              <button id="wsGenerate" class="btn" ${pct() === 100 ? '' : 'disabled'}>Generate Submission Package</button>
            </div>
          </div>
          <div class="card card-help">
            <div class="help-inner">
              <h3>Need Help?</h3>
              <div>Our tender experts are here to assist you</div>
              <div class="sp8"></div>
              <div>📞 +27 11 123 4567</div>
              <div>💬 WhatsApp Support</div>
              <div class="sp12"></div>
              <a class="btn" href="#/settings">Contact Support</a>
            </div>
          </div>
        </div>
      </section>
    `;
  },
    /**
   * Bind checklist actions and demo “Generate Submission Package”.
   * Later: replace with real calls to /api/compliance/*.
   * @return {void}
   */
  onMount() {
    document.querySelectorAll('[data-mark]').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.mark;
        const item = state.wsItems.find(i => i.key === key);
        if (item) item.done = true;
        // refresh the route to re-render
        const hash = location.hash;
        location.hash = ''; requestAnimationFrame(()=> location.hash = hash);
      });
    });
    document.getElementById('wsGenerate')?.addEventListener('click', () => {
      alert('ZIP package generator – placeholder');
    });
  }
};

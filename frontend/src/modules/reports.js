/**
 * @file Compliance report view: traffic-light status, missing items,
 *       and share/download actions. Later fetches /api/reports/:projectId.
 */

export default {
   /**
   * Render report page.
   * @return {string}
   */
  template() {
    return `
      <section class="report" aria-labelledby="report-title">
        <div class="grid cols-2">
          <div class="card">
            <div class="kpi"><h3>Compliance Report</h3><span class="pill pill-warn">RISK</span></div>
            <p class="muted">Compliance rating for your submission.</p>
            <div class="list">
              <div class="item"><div>Missing: <b>BBBEE Certificate</b></div><a class="btn" href="#/workspace">Fix</a></div>
            </div>
            <div class="row" style="margin-top:12px">
              <a class="btn ok" id="btnWhatsappReport" href="#">Send via WhatsApp</a>
              <a class="btn ghost" href="#">Download ZIP Pack</a>
            </div>
          </div>
          <div class="card">
            <h3>Summary</h3>
            <div class="list">
              <div class="item"><div>Admin docs</div><span class="pill">6/8</span></div>
              <div class="item"><div>Technical</div><span class="pill">1/2</span></div>
              <div class="item"><div>Pricing</div><span class="pill">1/1</span></div>
            </div>
          </div>
        </div>
      </section>
    `;
  },
   /**
   * Bind “Send via WhatsApp” (reads number from localStorage in demo).
   * Later: deep link to a hosted report URL.
   * @return {void}
   */
  onMount() {
    document.getElementById('btnWhatsappReport')?.addEventListener('click', (e)=>{
      e.preventDefault();
      const num = (localStorage.getItem('waNumber') || '').replace(/\D/g,'');
      if(!num) return alert('Add a WhatsApp number in Settings first.');
      const msg = encodeURIComponent('TenderPick: Your compliance report is ready. Status: RISK (demo).');
      window.open(`https://wa.me/${num}?text=${msg}`, '_blank');
    });
  }
};

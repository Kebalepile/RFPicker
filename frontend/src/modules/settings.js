import { state } from '../utils/state.js';

export default {
  template() {
    return `
      <section>
        <div class="card">
          <h3>Notifications</h3>
          <div class="row">
            <label class="chip"><input type="checkbox" id="enableWA" ${state.settings.whatsappEnabled ? 'checked':''}/> WhatsApp Report</label>
            <label class="chip"><input type="checkbox" id="enableSMS" ${state.settings.smsEnabled ? 'checked':''}/> SMS Alerts</label>
          </div>
          <div class="hr"></div>
          <label class="muted">WhatsApp Number</label>
          <div class="row">
            <input class="input" id="waNumber" placeholder="e.g. 069 848 8813" value="${state.settings.waNumber}" />
            <button class="btn" id="saveBtn">Save</button>
          </div>
        </div>
      </section>
    `;
  },
  onMount() {
    document.getElementById('saveBtn')?.addEventListener('click', ()=>{
      const wa = document.getElementById('waNumber').value.trim();
      localStorage.setItem('waNumber', wa);
      state.settings.waNumber = wa;
      state.settings.whatsappEnabled = document.getElementById('enableWA').checked;
      state.settings.smsEnabled = document.getElementById('enableSMS').checked;
      alert('Saved.');
    });
  }
};

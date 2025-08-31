/**
 * @file Settings page: notification toggles and WhatsApp number.
 *       Persists demo values in localStorage. Later calls /api/settings/notifications.
 */

import { state } from '../utils/state.js';

export default {
  /**
   * Render settings form.
   * @return {string}
   */
 template() {
  return `
    <section class="settings">
      <div class="card">
        <h3>Notifications</h3>
        <div class="row">
          <label class="chip">
            <input type="checkbox" id="enableWA" ${state.settings.whatsappEnabled ? 'checked':''}/>
            WhatsApp Report
          </label>
          <label class="chip">
            <input type="checkbox" id="enableSMS" ${state.settings.smsEnabled ? 'checked':''}/>
            SMS Alerts
          </label>
        </div>

        <div class="hr"></div>

        <label class="muted" for="waNumber">WhatsApp Number</label>
        <div class="row">
          <input class="input" id="waNumber" placeholder="e.g. 069 848 8813" value="${state.settings.waNumber}" />
          <button class="btn" id="saveBtn">Save</button>
        </div>
        <div id="waError" class="error-msg" style="display:none;"></div>
      </div>
    </section>
  `;
}
,
  /**
   * Bind save action: persists demo values locally.
   * @return {void}
   */
 onMount() {
  const waInput = document.getElementById('waNumber');
  const waError = document.getElementById('waError');
  const saveBtn = document.getElementById('saveBtn');

  function validateNumber(value) {
    const cleaned = value.replace(/\s+/g, '');
    return /^0\d{9}$/.test(cleaned);
  }

  saveBtn?.addEventListener('click', () => {
    const wa = waInput.value.trim();
    if (!validateNumber(wa)) {
      waInput.classList.add('error');
      waError.textContent = 'Enter a valid 10-digit number starting with 0.';
      waError.style.display = 'block';
      return;
    }
    waInput.classList.remove('error');
    waError.style.display = 'none';

    // Persist demo values
    localStorage.setItem('waNumber', wa);
    state.settings.waNumber = wa;
    state.settings.whatsappEnabled = document.getElementById('enableWA').checked;
    state.settings.smsEnabled = document.getElementById('enableSMS').checked;
    alert('Saved.');
  });
}

};

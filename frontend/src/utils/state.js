/**
 * @file App demo state and tiny DOM helper.
 *        Real data should come from backend services.
 *
 * @typedef {Object} ChecklistItem
 * @property {string} key
 * @property {string} label
 * @property {boolean} done
 * @property {string} note
 */

export const state = {
  settings: {
    /** @type {string} WhatsApp number (stored locally for demo) */
    waNumber: localStorage.getItem("waNumber") || "",
    /** @type {boolean} Toggle WhatsApp notifications */
    whatsappEnabled: false,
    /** @type {boolean} Toggle SMS notifications */
    smsEnabled: false
  },
  /** @type {ChecklistItem[]} */
  wsItems: [
    {
      key: "sbd4",
      label: "SBD 4 – Declaration of Interest",
      done: true,
      note: "Avoid conflicts of interest"
    },
    {
      key: "sbd61",
      label: "SBD 6.1 – Preference Points Claim",
      done: true,
      note: "BBBEE preference points"
    },
    {
      key: "tax",
      label: "Tax Clearance Certificate",
      done: true,
      note: "Valid SARS PIN/certificate"
    },
    {
      key: "bbee",
      label: "BBBEE Certificate",
      done: false,
      note: "Expires soon / missing"
    }
  ]
};

/**
 * Create a DOM node from an HTML string.
 * @param {string} html
 * @return {Element}
 */
export const el = html => {
  const t = document.createElement("template");
  t.innerHTML = html.trim();
  return t.content.firstChild;
};

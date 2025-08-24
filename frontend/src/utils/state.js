export const state = {
  settings: {
    waNumber: localStorage.getItem('waNumber') || '',
    whatsappEnabled: false,
    smsEnabled: false,
  },
  wsItems: [
    { key: 'sbd4',  label: 'SBD 4 – Declaration of Interest', done: true,  note: 'Avoid conflicts of interest' },
    { key: 'sbd61', label: 'SBD 6.1 – Preference Points Claim', done: true,  note: 'BBBEE preference points' },
    { key: 'tax',   label: 'Tax Clearance Certificate',        done: true,  note: 'Valid SARS PIN/certificate' },
    { key: 'bbee',  label: 'BBBEE Certificate',                done: false, note: 'Expires soon / missing' },
  ],
};

export const el = (html) => {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstChild;
};

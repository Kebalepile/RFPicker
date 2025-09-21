/**
 * @file Tender List page: loads from /assets/database/open_tenders.json
 * and renders collapsible sections for Details / Enquiries / Briefing Session / Documents.
 */

const DATA_URL = '/assets/database/open_tenders.json';

// Pretty labels for top-level summary line
const HEAD_LABELS = {
  tenderNumber: 'Tender Number',
  title: 'Title',
  category: 'Category',
  advertisedDate: 'Advertised',
  closingDate: 'Closing',
  buyerName: 'Buyer',
  eSubmission: 'e-Submission',
  tenderType: 'Tender Type',
  province: 'Province',
  datePublished: 'Date Published',
  detailUrl: 'Detail URL'
};

function categoryIcon(cat) {
  if (!cat) return '📑';
  return /RFQ/i.test(cat) ? '📄' : '📑';
}
function provinceIcon(p) {
  const map = {
    Gauteng: '🏙️', 'Western Cape': '🗺️', 'Eastern Cape': '🌊', 'North West': '🌾',
    Limpopo: '🌿', 'KwaZulu-Natal': '🏖️', 'Free State': '🌻', Mpumalanga: '⛰️',
    'Northern Cape': '🏜️', National: '🇿🇦'
  };
  return map[p] || '🗺️';
}

// ----- Utilities -----
// --- Document helpers ---
function fileMetaFromUrl(url, fallbackText = '') {
  try {
    const u = new URL(url, location.href);
    const nameFromQuery =
      u.searchParams.get('downloadedFileName') ||
      u.searchParams.get('fileName') ||
      '';
    const pathnameName = u.pathname.split('/').pop() || '';
    const rawName = decodeURIComponent(nameFromQuery || pathnameName || fallbackText);

    // extension
    const m = rawName.match(/\.([a-z0-9]{2,6})(?:$|\?)/i);
    const ext = (m ? m[1] : '').toLowerCase();

    return {
      filename: rawName || fallbackText || 'Document',
      ext,
      kind: extKind(ext)
    };
  } catch {
    // If URL parsing fails, best effort from fallback text
    const m = (fallbackText || '').match(/\.([a-z0-9]{2,6})$/i);
    const ext = (m ? m[1] : '').toLowerCase();
    return { filename: fallbackText || 'Document', ext, kind: extKind(ext) };
  }
}

function extKind(ext) {
  if (!ext) return 'file';
  if (['pdf'].includes(ext)) return 'pdf';
  if (['doc', 'docx', 'rtf', 'odt'].includes(ext)) return 'word';
  if (['xls', 'xlsx', 'csv', 'ods'].includes(ext)) return 'sheet';
  if (['ppt', 'pptx', 'odp'].includes(ext)) return 'slides';
  if (['zip', 'rar', '7z'].includes(ext)) return 'archive';
  if (['jpg','jpeg','png','gif','tif','tiff','bmp','webp'].includes(ext)) return 'image';
  if (['txt','md','json','xml'].includes(ext)) return 'text';
  return 'file';
}

function kindIcon(kind) {
  switch (kind) {
    case 'pdf':     return '📄';
    case 'word':    return '📝';
    case 'sheet':   return '📊';
    case 'slides':  return '📈';
    case 'archive': return '🗜️';
    case 'image':   return '🖼️';
    case 'text':    return '📃';
    default:        return '📁';
  }
}

const isObj = v => v && typeof v === 'object' && !Array.isArray(v);
const titleCase = s => (s || '').replace(/[_\-]+/g, ' ')
  .replace(/\s+/g, ' ')
  .trim()
  .replace(/\b\w/g, c => c.toUpperCase());

/**
 * Render a <ul> of key/value rows for a section.
 * - If a *_labels map is present, we use its original labels; otherwise we prettify keys.
 * - Preserves multiline values with <br>.
 */
function renderKV(obj, labelsMap) {
  if (!isObj(obj) || Object.keys(obj).length === 0) {
    return `<div class="muted small">No info.</div>`;
  }
  const rows = Object.entries(obj).map(([k, v]) => {
    if (v == null || v === '') return '';
    const label = (labelsMap && labelsMap[k]) || (labelsMap && labelsMap[k.replace(/_/g, ' ')])
      ? (labelsMap[k] || labelsMap[k.replace(/_/g, ' ')])
      : titleCase(k);
    const value = String(v).trim().replace(/\n/g, '<br>');
    return `<li class="kv-row"><span class="kv-k">${label}</span><span class="kv-v">${value}</span></li>`;
  }).filter(Boolean).join('');
  return rows ? `<ul class="kv">${rows}</ul>` : `<div class="muted small">No info.</div>`;
}

/** Render documents array [{text,url}] */
function renderDocs(docs) {
  if (!Array.isArray(docs) || docs.length === 0) {
    return `<div class="muted small">No documents.</div>`;
  }

  const items = docs.map(d => {
    if (!d || (!d.text && !d.url)) return '';
    const text = (d.text || d.url).trim();
    const url  = (d.url || '#').trim();

    const meta = fileMetaFromUrl(url, text);
    const icon = kindIcon(meta.kind);
    const chip = `<span class="doc-chip doc-${meta.kind}">${meta.ext ? meta.ext.toUpperCase() : 'FILE'}</span>`;

    // Optional copy button (will be delegated via onMount)
    const copyBtn = `<button class="btn-link copy-doc" data-url="${encodeURIComponent(url)}" title="Copy link">Copy</button>`;

    return `
      <li class="doc-row">
        <div class="doc-main">
          <span class="doc-icon">${icon}</span>
          <a class="doc-link" href="${url}" target="_blank" rel="noopener">${meta.filename}</a>
          ${chip}
        </div>
        <div class="doc-actions">
          ${copyBtn}
        </div>
      </li>
    `;
  }).filter(Boolean).join('');

  return `<ul class="docs">${items}</ul>`;
}


/** Collapsible section */
function section(label, innerHTML, open = false) {
  return `
    <details class="sect" ${open ? 'open' : ''}>
      <summary>${label}</summary>
      <div class="sect-body">${innerHTML}</div>
    </details>
  `;
}

// ----- Card renderer -----
function card(t) {
  const cat = t.category || '';
  const prov = t.province || '';
  const buyer = t.buyerName || '';
  const headline = t.title || t.tenderNumber || 'Tender';

  // prefer normalized maps, but also look for *_labels to preserve exact Q wording
  const details           = t.details || {};
  const detailsLabels     = t.details_labels || null;
  const enquiries         = t.enquiries || {};
  const enquiriesLabels   = t.enquiries_labels || null;
  const briefing          = t.briefingSession || {};
  const briefingLabels    = t.briefingSession_labels || null;
  const tenderDocuments   = t.tenderDocuments || t.documentLinks || [];

  // Build collapsible blocks
  const detailsBlock  = renderKV(details, detailsLabels);
  const enqBlock      = renderKV(enquiries, enquiriesLabels);
  const briefBlock    = renderKV(briefing, briefingLabels);
  const docsBlock     = renderDocs(tenderDocuments);

  return `
  <div class="item">
    <div>
      <b>${categoryIcon(cat)} ${headline}</b>
      <div class="muted">
        ${prov ? `${provinceIcon(prov)} ${prov}` : ''}${prov && buyer ? ' · ' : ''}${buyer}
      </div>
      <div class="muted small">
        ${t.advertisedDate ? `Posted ${t.advertisedDate}` : ''}${t.advertisedDate && t.closingDate ? ' · ' : ''}${t.closingDate ? `Closes ${t.closingDate}` : ''}
      </div>
    </div>

    <div class="stack" style="margin-top:12px">
      ${section('Details',          detailsBlock,  true)}
      ${section('Enquiries',        enqBlock,      false)}
      ${section('Briefing Session', briefBlock,    false)}
      ${section('Tender Documents', docsBlock,     false)}
    </div>

    <div class="row" style="margin-top:10px">
      ${t.detailUrl ? `<a class="btn ghost" href="${t.detailUrl}" target="_blank" rel="noopener">Detail</a>` : ''}
      <a class="btn" href="#/workspace">Use</a>
    </div>
  </div>`;
}

function renderList(rows) {
  const list = document.getElementById('tenderList');
  list.innerHTML =
    (rows && rows.length ? rows.map(card).join('') : '') ||
    `<div class="muted">No tenders match your filters.</div>`;
}

function uniqueSorted(arr) {
  return Array.from(new Set(arr.filter(Boolean))).sort((a, b) => a.localeCompare(b));
}

export default {
  template() {
    return `
      <section class="tenders">
        <div class="card">
          <div class="row between">
            <h3>Tenders</h3>
            <div class="row">
              <a class="chip" data-band="small" style="display:none"></a>
              <a class="chip" data-band="mid" style="display:none"></a>
              <a class="chip" data-band="big" style="display:none"></a>
            </div>
          </div>

          <div class="row" style="margin-top:10px">
            <input class="input" id="q" placeholder="Search title, buyer or number…" />
            <select class="input" id="sector">
              <option value="">All categories</option>
            </select>
            <select class="input" id="province">
              <option value="">All provinces</option>
            </select>
            <a class="btn ghost" id="btnReset">Reset</a>
          </div>

          <div class="hr"></div>
          <div class="list" id="tenderList"></div>
        </div>
      </section>
    `;
  },

  async onMount() {
    const els = {
      q: document.getElementById('q'),
      sector: document.getElementById('sector'),
      province: document.getElementById('province'),
      reset: document.getElementById('btnReset')
    };

    let DATA = [];
    try {
      const resp = await fetch(DATA_URL, { cache: 'no-store' });
      DATA = await resp.json();
    } catch (e) {
      console.error('Failed to load tenders JSON:', e);
      renderList([]);
      return;
    }

    const categories = uniqueSorted(DATA.map(t => t.category || ''));
    const provinces  = uniqueSorted(DATA.map(t => t.province || ''));
    categories.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c; opt.textContent = c;
      els.sector.appendChild(opt);
    });
    provinces.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p; opt.textContent = p;
      els.province.appendChild(opt);
    });

    const apply = () => {
      const q = (els.q.value || '').toLowerCase();
      const cat = els.sector.value;
      const prov = els.province.value;

      const rows = DATA.filter(t => {
        const matchesQ =
          !q ||
          (t.title && t.title.toLowerCase().includes(q)) ||
          (t.buyerName && t.buyerName.toLowerCase().includes(q)) ||
          (t.tenderNumber && String(t.tenderNumber).toLowerCase().includes(q));

        const matchesCat  = !cat  || (t.category === cat);
        const matchesProv = !prov || (t.province === prov);

        return matchesQ && matchesCat && matchesProv;
      }).sort((a, b) => {
        // As-is text sort on closingDate; replace with real date parsing later if needed
        return String(a.closingDate||'').localeCompare(String(b.closingDate||''));
      });

      renderList(rows);
    };

    ['input', 'change'].forEach(ev => {
      els.q.addEventListener(ev, apply);
      els.sector.addEventListener(ev, apply);
      els.province.addEventListener(ev, apply);
    });

    els.reset.addEventListener('click', () => {
      els.q.value = '';
      els.sector.value = '';
      els.province.value = '';
      renderList(DATA);
    });

    renderList(DATA);
    // Delegate copy buttons
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.copy-doc');
  if (!btn) return;
  const url = decodeURIComponent(btn.getAttribute('data-url') || '');
  if (!url) return;
  navigator.clipboard?.writeText(url).then(() => {
    btn.textContent = 'Copied!';
    setTimeout(() => (btn.textContent = 'Copy'), 1200);
  }).catch(() => {
    // Fallback
    const ta = document.createElement('textarea');
    ta.value = url;
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); btn.textContent = 'Copied!'; } catch {}
    document.body.removeChild(ta);
    setTimeout(() => (btn.textContent = 'Copy'), 1200);
  });
});

  }
};

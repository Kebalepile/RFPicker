/**
 * Tender list with client-side pagination.
 * - Loads /assets/database/open_tenders.json
 * - Filters by search/category/province
 * - Renders only a page slice (fast even with 2k+ items)
 */

const DATA_URL = '/assets/database/open_tenders.json';
const DEFAULT_PAGE_SIZE = 12;

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

const isObj = v => v && typeof v === 'object' && !Array.isArray(v);
const titleCase = s => (s || '').replace(/[_\-]+/g, ' ')
  .replace(/\s+/g, ' ')
  .trim()
  .replace(/\b\w/g, c => c.toUpperCase());

function renderKV(obj, labelsMap) {
  if (!isObj(obj) || Object.keys(obj).length === 0) {
    return `<div class="muted small">No info.</div>`;
  }
  const rows = Object.entries(obj).map(([k, v]) => {
    if (v == null || v === '') return '';
    const label = (labelsMap && (labelsMap[k] || labelsMap[k.replace(/_/g, ' ')])) || titleCase(k);
    const value = String(v).trim().replace(/\n/g, '<br>');
    return `<li class="kv-row"><span class="kv-k">${label}</span><span class="kv-v">${value}</span></li>`;
  }).filter(Boolean).join('');
  return rows ? `<ul class="kv">${rows}</ul>` : `<div class="muted small">No info.</div>`;
}

function fileMetaFromUrl(url, fallbackText = '') {
  try {
    const u = new URL(url, location.href);
    const nameFromQuery =
      u.searchParams.get('downloadedFileName') ||
      u.searchParams.get('fileName') || '';
    const pathnameName = u.pathname.split('/').pop() || '';
    const rawName = decodeURIComponent(nameFromQuery || pathnameName || fallbackText);
    const m = rawName.match(/\.([a-z0-9]{2,6})(?:$|\?)/i);
    const ext = (m ? m[1] : '').toLowerCase();
    return { filename: rawName || fallbackText || 'Document', ext, kind: extKind(ext) };
  } catch {
    const m = (fallbackText || '').match(/\.([a-z0-9]{2,6})$/i);
    const ext = (m ? m[1] : '').toLowerCase();
    return { filename: fallbackText || 'Document', ext, kind: extKind(ext) };
  }
}
function extKind(ext) {
  if (!ext) return 'file';
  if (['pdf'].includes(ext)) return 'pdf';
  if (['doc','docx','rtf','odt'].includes(ext)) return 'word';
  if (['xls','xlsx','csv','ods'].includes(ext)) return 'sheet';
  if (['ppt','pptx','odp'].includes(ext)) return 'slides';
  if (['zip','rar','7z'].includes(ext)) return 'archive';
  if (['jpg','jpeg','png','gif','tif','tiff','bmp','webp'].includes(ext)) return 'image';
  if (['txt','md','json','xml'].includes(ext)) return 'text';
  return 'file';
}
function kindIcon(kind) {
  switch (kind) {
    case 'pdf': return '📄';
    case 'word': return '📝';
    case 'sheet': return '📊';
    case 'slides': return '📈';
    case 'archive': return '🗜️';
    case 'image': return '🖼️';
    case 'text': return '📃';
    default: return '📁';
  }
}

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
    const copyBtn = `<button class="btn-link copy-doc" data-url="${encodeURIComponent(url)}" title="Copy link">Copy</button>`;
    return `
      <li class="doc-row">
        <div class="doc-main">
          <span class="doc-icon">${icon}</span>
          <a class="doc-link" href="${url}" target="_blank" rel="noopener">${meta.filename}</a>
          ${chip}
        </div>
        <div class="doc-actions">${copyBtn}</div>
      </li>`;
  }).filter(Boolean).join('');
  return `<ul class="docs">${items}</ul>`;
}

function section(label, innerHTML, open = false) {
  return `
    <details class="sect" ${open ? 'open' : ''}>
      <summary><span class="chev" aria-hidden="true"></span>${label}</summary>
      <div class="sect-body">${innerHTML}</div>
    </details>`;
}

function card(t) {
  const cat = t.category || '';
  const prov = t.province || '';
  const buyer = t.buyerName || '';
  const headline = t.title || t.tenderNumber || 'Tender';

  const details         = t.details || {};
  const detailsLabels   = t.details_labels || null;
  const enquiries       = t.enquiries || {};
  const enquiriesLabels = t.enquiries_labels || null;
  const briefing        = t.briefingSession || {};
  const briefingLabels  = t.briefingSession_labels || null;
  const documents       = t.tenderDocuments || t.documentLinks || [];

  const detailsBlock = renderKV(details, detailsLabels);
  const enqBlock     = renderKV(enquiries, enquiriesLabels);
  const briefBlock   = renderKV(briefing, briefingLabels);
  const docsBlock    = renderDocs(documents);

  // top-line chips like eTenders “Category • Province • Buyer”
  const metaLine = [
    prov ? `${provinceIcon(prov)} ${prov}` : '',
    buyer || '',
  ].filter(Boolean).join(' · ');

  return `
  <article class="tcard">
    <header class="tcard-head">
      <div class="tcard-title">
        <span class="cat">${categoryIcon(cat)}</span>
        <b class="title">${headline}</b>
      </div>
      <div class="tcard-sub">
        ${metaLine ? `<span class="muted">${metaLine}</span>` : ''}
        <span class="spacer"></span>
        <span class="dates muted small">
          ${t.advertisedDate ? `Posted ${t.advertisedDate}` : ''}${t.advertisedDate && t.closingDate ? ' · ' : ''}${t.closingDate ? `Closes ${t.closingDate}` : ''}
        </span>
      </div>
    </header>

    <div class="tcard-body">
      ${section('Details',          detailsBlock,  false)}
      ${section('Enquiries',        enqBlock,      false)}
      ${section('Briefing Session', briefBlock,    false)}
      ${section('Tender Documents', docsBlock,     false)}
    </div>

    <footer class="tcard-foot">
      ${t.detailUrl ? `<a class="btn ghost" href="${t.detailUrl}" target="_blank" rel="noopener">Detail</a>` : ''}
      <a class="btn" href="#/workspace">Use</a>
    </footer>
  </article>`;
}

// after your apply() definition, hook a delegated listener once (inside onMount)
document.addEventListener('click', (e) => {
  const sum = e.target.closest('.tcard .sect > summary');
  if (!sum) return;
  const detailsEl = sum.parentElement;
  // close sibling sections inside the SAME card (accordion feel like eTenders)
  detailsEl.parentElement.querySelectorAll(':scope > .sect').forEach(d => {
    if (d !== detailsEl) d.removeAttribute('open');
  });
});


// ---------- Pagination helpers ----------
function paginate(arr, page, pageSize) {
  const total = arr.length;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const p = Math.min(Math.max(1, page), pages);
  const start = (p - 1) * pageSize;
  const end = Math.min(start + pageSize, total);
  return { slice: arr.slice(start, end), total, pages, page: p, start: start + 1, end };
}

function renderPager({ page, pages, total }) {
  const disablePrev = page <= 1 ? 'disabled' : '';
  const disableNext = page >= pages ? 'disabled' : '';

  return `
    <div class="pager">
      <div class="pager-left">
        <span class="muted small">Page ${page} of ${pages} · ${total} tenders</span>
      </div>
      <div class="pager-right">
        <button class="btn ghost pg-first" ${disablePrev}>First</button>
        <button class="btn ghost pg-prev" ${disablePrev}>Prev</button>
        <button class="btn ghost pg-next" ${disableNext}>Next</button>
        <button class="btn ghost pg-last" ${disableNext}>Last</button>
        <select class="input pg-size" title="Page size">
          ${[12,15,24,50].map(n => `<option value="${n}" ${n===DEFAULT_PAGE_SIZE?'selected':''}>${n}/page</option>`).join('')}
        </select>
      </div>
    </div>`;
}

// ---------- View ----------
function renderList(rows, page, pageSize) {
  const list = document.getElementById('tenderList');
  const pagerHost = document.getElementById('tenderPager');

  const { slice, total, pages, page: p } = paginate(rows, page, pageSize);

  list.innerHTML =
    (slice && slice.length ? slice.map(card).join('') : '') ||
    `<div class="muted">No tenders match your filters.</div>`;

  pagerHost.innerHTML = renderPager({ page: p, pages, total });
  return { page: p, pages, total };
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

          <div class="row" style="margin-top:10px; gap:8px; flex-wrap:wrap;">
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
          <div id="tenderPager" style="margin-top:12px"></div>
        </div>
      </section>
    `;
  },

  async onMount() {
    const els = {
      q: document.getElementById('q'),
      sector: document.getElementById('sector'),
      province: document.getElementById('province'),
      reset: document.getElementById('btnReset'),
      list: document.getElementById('tenderList'),
      pager: document.getElementById('tenderPager')
    };
// Smooth-scroll to the top of the tender list/card
const scrollToTendersTop = () => {
  // Aim for the card wrapper so the header stays visible
  const host = els.list?.closest('.card') || els.list || document.querySelector('.tenders');
  if (!host) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }
  const y = host.getBoundingClientRect().top + window.pageYOffset - 8; // small cushion
  window.scrollTo({ top: y, behavior: 'smooth' });
};

    let DATA = [];
    try {
      const resp = await fetch(DATA_URL, { cache: 'no-store' });
      DATA = await resp.json();
    } catch (e) {
      console.error('Failed to load tenders JSON:', e);
      renderList([], 1, DEFAULT_PAGE_SIZE);
      return;
    }

    // Filters
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

    // State
    const state = { page: 1, pageSize: DEFAULT_PAGE_SIZE, filtered: DATA };

    const computeFiltered = () => {
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
      }).sort((a, b) => String(a.closingDate||'').localeCompare(String(b.closingDate||'')));

      return rows;
    };

    const apply = (opts = {}) => {
      if (opts.resetPage) state.page = 1;
      state.filtered = computeFiltered();
      const { page } = renderList(state.filtered, state.page, state.pageSize);
      state.page = page; // in case it was clamped
    };

    // Events
    const onInput = () => apply({ resetPage: true });
    ['input', 'change'].forEach(ev => {
      els.q.addEventListener(ev, onInput);
      els.sector.addEventListener(ev, onInput);
      els.province.addEventListener(ev, onInput);
    });

    els.reset.addEventListener('click', () => {
      els.q.value = '';
      els.sector.value = '';
      els.province.value = '';
      state.page = 1;
      state.pageSize = DEFAULT_PAGE_SIZE;
      apply({ resetPage: true });
    });

    // Pager controls (event delegation)
    els.pager.addEventListener('click', (e) => {
      const first = e.target.closest('.pg-first');
      const prev  = e.target.closest('.pg-prev');
      const next  = e.target.closest('.pg-next');
      const last  = e.target.closest('.pg-last');
      if (!first && !prev && !next && !last) return;

      const { pages } = paginate(state.filtered, state.page, state.pageSize);
      if (first) state.page = 1;
      if (prev)  state.page = Math.max(1, state.page - 1);
      if (next)  state.page = Math.min(pages, state.page + 1);
      if (last)  state.page = pages;
      apply();
       scrollToTendersTop()
    });

    els.pager.addEventListener('change', (e) => {
      const sel = e.target.closest('.pg-size');
      if (!sel) return;
      const n = parseInt(sel.value, 10);
      if (!isNaN(n) && n > 0) {
        state.pageSize = n;
        state.page = 1;
        apply();
        scrollToTendersTop();
      }
    });

    // Copy-document links (delegated)
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.copy-doc');
      if (!btn) return;
      const url = decodeURIComponent(btn.getAttribute('data-url') || '');
      if (!url) return;
      navigator.clipboard?.writeText(url).then(() => {
        btn.textContent = 'Copied!';
        setTimeout(() => (btn.textContent = 'Copy'), 1200);
      }).catch(() => {
        const ta = document.createElement('textarea');
        ta.value = url;
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); btn.textContent = 'Copied!'; } catch {}
        document.body.removeChild(ta);
        setTimeout(() => (btn.textContent = 'Copy'), 1200);
      });
    });

    // Initial render
    apply({ resetPage: true });
  }
};

/**
 * Tender list with client-side pagination.
 * - Loads /assets/database/open_tenders.json
 * - Filters by search/category/province
 * - Renders only a page slice (fast even with 2k+ items)
 */

const DATA_URL = './assets/database/open_tenders.json';
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

  const metaLine = [
    prov ? `${provinceIcon(prov)} ${prov}` : '',
    buyer || '',
  ].filter(Boolean).join(' · ');

  return `
  <article class="tcard">
    <header class="tcard-head">
      <div class="tcard-title">
        <span class="cat">${categoryIcon(cat)}</span>
        <br/><br/>
        <p >${headline}</p>
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

// Close siblings in a card (accordion)
document.addEventListener('click', (e) => {
  const sum = e.target.closest('.tcard .sect > summary');
  if (!sum) return;
  const detailsEl = sum.parentElement;
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

// Build numbered page items with ellipses (window size configurable)
function buildPageItems(current, total, windowSize = 7) {
  const items = [];
  const add = (type, num) => items.push({ type, num });

  if (total <= windowSize) {
    for (let i = 1; i <= total; i++) add('num', i);
    return items;
  }
  const inner = windowSize - 2; // excluding first/last
  let left = Math.max(2, current - Math.floor(inner / 2));
  let right = Math.min(total - 1, left + inner - 1);
  left = Math.max(2, Math.min(left, Math.max(2, right - inner + 1)));

  add('num', 1);
  if (left > 2) add('ellipsis');
  for (let i = left; i <= right; i++) add('num', i);
  if (right < total - 1) add('ellipsis');
  add('num', total);
  return items;
}

function renderPager({ page, pages, total }) {
  const disablePrev = page <= 1 ? 'disabled' : '';
  const disableNext = page >= pages ? 'disabled' : '';

  const nums = buildPageItems(page, pages, 7)
    .map(p =>
      p.type === 'ellipsis'
        ? `<span class="pager-ellipsis">…</span>`
        : `<button class="btn ghost pg-num ${p.num === page ? 'active' : ''}"
                   data-page="${p.num}" ${p.num === page ? 'aria-current="page"' : ''}>${p.num}</button>`
    ).join('');

  return `
    <nav class="pager" role="navigation" aria-label="Pagination">
      <div class="pager-left">
        <span class="muted small">Page ${page} of ${pages} · ${total} tenders</span>
      </div>
      <div class="pager-right">
        <button class="btn ghost pg-first" ${disablePrev} aria-label="First page">First</button>
        <button class="btn ghost pg-prev"  ${disablePrev} aria-label="Previous page">Prev</button>
        ${nums}
        <button class="btn ghost pg-next"  ${disableNext} aria-label="Next page">Next</button>
        <button class="btn ghost pg-last"  ${disableNext} aria-label="Last page">Last</button>
        <select class="input pg-size" title="Page size">
          ${[12,15,24,50].map(n => `<option value="${n}" ${n===DEFAULT_PAGE_SIZE?'selected':''}>${n}/page</option>`).join('')}
        </select>
      </div>
    </nav>`;
}

// Build one skeleton tcard (parent + children placeholders)
function skeletonCardTemplate() {
  const baseStyle = 'background:linear-gradient(90deg,#e5e7eb 25%,#f3f4f6 37%,#e5e7eb 63%);background-size:400% 100%;animation:sk-shimmer 1.4s ease infinite;-webkit-animation:sk-shimmer 1.4s ease infinite;border-radius:8px;';
  const sk = (extra) => `class="skeleton" style="${baseStyle}${extra}"`;

  return `
    <article class="tcard skel-tcard" aria-hidden="true" style="border:1px solid #e5e7eb;border-radius:14px;background:#fff;padding:14px;display:grid;gap:10px;">
      <div style="display:flex;gap:8px;align-items:center;">
        <span ${sk('width:18px;height:18px;border-radius:4px;')}></span>
        <span ${sk('height:14px;flex:1;')}></span>
      </div>
      <div style="display:flex;gap:8px;align-items:center;">
        <span ${sk('height:12px;width:35%;')}></span>
        <span style="flex:1;"></span>
        <span ${sk('height:12px;width:20%;')}></span>
      </div>
      <div ${sk('height:1px;')}></div>
      <div style="display:flex;gap:8px;align-items:center;">
        <span ${sk('height:14px;width:30%;')}></span>
      </div>
      <div style="display:flex;gap:8px;align-items:center;">
        <span ${sk('height:12px;width:70%;')}></span>
      </div>
      <div style="display:flex;gap:8px;align-items:center;">
        <span ${sk('height:18px;width:70px;border-radius:999px;')}></span>
        <span ${sk('height:18px;width:70px;border-radius:999px;')}></span>
        <span ${sk('height:18px;width:100px;border-radius:999px;')}></span>
      </div>
      <div style="display:flex;gap:8px;align-items:center;">
        <span ${sk('height:32px;width:96px;border-radius:8px;')}></span>
        <span ${sk('height:32px;width:80px;border-radius:8px;')}></span>
      </div>
    </article>
  `;
}



// Show a full parent-level skeleton shell with N child cards + pager skeleton
function showSkeletonShell(els, count) {
  // Fill list (.tenders > .card > #tenderList) with N skeleton tcards
  const n = Math.max(3, Math.min(count || DEFAULT_PAGE_SIZE, 12));
  els.list.innerHTML = Array.from({ length: n }, skeletonCardTemplate).join('');

  // Pager skeleton (parent area feedback)
  els.pager.innerHTML = `
    <div class="pager">
      <div class="pager-left">
        <span class="skeleton skel-line" style="width:160px;"></span>
      </div>
      <div class="pager-right">
        <span class="skeleton skel-btn" style="width:72px;"></span>
        <span class="skeleton skel-btn" style="width:72px;"></span>
        <span class="skeleton skel-btn" style="width:160px;"></span>
      </div>
    </div>
  `;
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
// Ensure skeleton CSS exists (injects a tiny fallback if your CSS bundle didn't load on GH Pages)
function ensureSkeletonStyles() {
  const test = document.createElement('div');
  test.className = 'skeleton skel-line';
  document.body.appendChild(test);
  const hasAnim = getComputedStyle(test).animationName !== 'none';
  document.body.removeChild(test);
  if (hasAnim) return;

  const css = `
    .skeleton{background:linear-gradient(90deg,#e5e7eb 25%,#f3f4f6 37%,#e5e7eb 63%);background-size:400% 100%;animation:sk-shimmer 1.4s ease infinite;-webkit-animation:sk-shimmer 1.4s ease infinite;border-radius:8px}
    @keyframes sk-shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}
    @-webkit-keyframes sk-shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}
    .skel-line{height:14px}.skel-small{height:12px}.skel-chip{height:18px;width:70px;border-radius:999px}.skel-btn{height:32px;width:96px;border-radius:8px}
    .skel-tcard{border:1px solid #e5e7eb;border-radius:14px;background:#fff;padding:14px;display:grid;gap:10px}
  `;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
}


// Safer closest() without optional chaining for older mobile browsers
function closestSafe(el, selector) {
  while (el && el.nodeType === 1) {
    if (el.matches(selector)) return el;
    el = el.parentElement;
  }
  return null;
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
    ensureSkeletonStyles();
    const els = {
      q: document.getElementById('q'),
      sector: document.getElementById('sector'),
      province: document.getElementById('province'),
      reset: document.getElementById('btnReset'),
      list: document.getElementById('tenderList'),
      pager: document.getElementById('tenderPager')
    };
    // Show parent-level skeleton immediately (slow networks feel snappier)
    showSkeletonShell(els, DEFAULT_PAGE_SIZE);

    // Smooth-scroll to the top of the tender list/card
   const scrollToTendersTop = () => {
  const host = closestSafe(els.list, '.card') || els.list || document.querySelector('.tenders');
  const y = host ? host.getBoundingClientRect().top + window.pageYOffset - 8 : 0;
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
  // Parent-level skeleton (list + pager)
  showSkeletonShell(els, state.pageSize);

  if (opts.resetPage) state.page = 1;
  state.filtered = computeFiltered();

  // Let the skeleton paint first; then render the real page
  setTimeout(() => {
    const { page } = renderList(state.filtered, state.page, state.pageSize);
    state.page = page;
  }, 150);
};


    // Events: filters
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
      scrollToTendersTop();
    });

    // Pager controls (delegated)
    els.pager.addEventListener('click', (e) => {
      const first = e.target.closest('.pg-first');
      const prev  = e.target.closest('.pg-prev');
      const next  = e.target.closest('.pg-next');
      const last  = e.target.closest('.pg-last');
      const num   = e.target.closest('.pg-num');
      if (!first && !prev && !next && !last && !num) return;

      const { pages } = paginate(state.filtered, state.page, state.pageSize);

      if (first) state.page = 1;
      else if (prev) state.page = Math.max(1, state.page - 1);
      else if (next) state.page = Math.min(pages, state.page + 1);
      else if (last) state.page = pages;
      else if (num) {
        const n = parseInt(num.getAttribute('data-page'), 10);
        if (!isNaN(n)) state.page = Math.min(Math.max(1, n), pages);
      }

      apply();
      scrollToTendersTop();
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

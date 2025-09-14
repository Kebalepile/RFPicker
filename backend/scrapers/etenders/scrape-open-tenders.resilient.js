const fs = require('fs');
const playwright = require('playwright');

// ==== Configurable Settings ====
const HEADLESS = false;                     // toggle: headless vs visible
const START_URL = 'https://www.etenders.gov.za/Home/opportunities?id=1';
const OUTPUT_FILE = 'open_tenders.json';
const CHECKPOINT_FILE = 'scrape_checkpoint.json';
const TABLE_SELECTOR = 'table#tendeList';   // confirmed ID
const ROW_SELECTOR = '#tendeList tbody tr';
const PAGINATE_NEXT_SEL = '#tendeList_paginate .next a';
const PAGE_LENGTH_SELECT = 'select[name="tendeList_length"]';

const USE_API_PRIMARY = false;              // prefer DOM scraping for detail rows

// Random delay between actions (100–300ms)
function humanDelay() { return new Promise(r => setTimeout(r, 100 + Math.floor(Math.random()*201))); }
const RETRY_DELAYS = [300, 700, 1200, 2000, 3500];

(async () => {
  // ==== Initialize output + checkpoint ====
  let results = [];
  let lastPageDone = 0;
  let lastRowDone = -1;
  let seenKeys = new Set();

  if (fs.existsSync(OUTPUT_FILE)) {
    try {
      results = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf8'));
      for (const t of results) {
        seenKeys.add(`${(t.tenderNumber||'').toUpperCase()}|${t.title||''}`);
      }
    } catch {}
  }
  if (fs.existsSync(CHECKPOINT_FILE)) {
    try {
      const cp = JSON.parse(fs.readFileSync(CHECKPOINT_FILE, 'utf8'));
      lastPageDone = cp.page || 0;
      lastRowDone = cp.rowIndex ?? -1;
      console.log(`Resuming from page ${lastPageDone}, row ${lastRowDone + 1}`);
    } catch {}
  }

  // ==== Launch ====
  const browser = await playwright.chromium.launch({ headless: HEADLESS });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36',
  });
  const page = await context.newPage();
  page.setDefaultTimeout(60000);

  // Skipping API-first logic because USE_API_PRIMARY is false …

  // ============ DOM scraping with details ============
  console.log('Opening eTenders portal…');
  await page.goto(START_URL, { waitUntil: 'domcontentloaded' });

  // dismiss pop-ups best effort ...
  const dismissOverlays = async () => {
    await page.locator('#nextButton').click({ timeout: 1500 }).catch(() => {});
    await page.locator('#closeButton').click({ timeout: 1500 }).catch(() => {});
    await page.getByRole('button', { name: /close/i }).first().click({ timeout: 1500 }).catch(() => {});
    for (let i = 0; i < 4; i++) {
      const btn = page.getByText(/Got it, Thanks!/i).first();
      if (await btn.count()) { await btn.click({ timeout: 1500 }).catch(() => {}); await humanDelay(); } else break;
    }
  };
  await dismissOverlays();

  // Click “Currently Advertised”
  await page.getByRole('link', { name: /Currently Advertised/i }).first().click({ timeout: 3000 }).catch(() => {});
  await humanDelay();

  // Show 100 per page
  if (await page.locator(PAGE_LENGTH_SELECT).count()) {
    await page.selectOption(PAGE_LENGTH_SELECT, '100').catch(() => {});
    await humanDelay();
  }

  // Wait for table
  const waitForTableReady = async () => {
    const start = Date.now();
    while (Date.now() - start < 60000) {
      await dismissOverlays();
      if (await page.locator(ROW_SELECTOR).count() > 0) return true;
      if (await page.locator(TABLE_SELECTOR).count()) {
        await page.waitForTimeout(800);
        if (await page.locator(ROW_SELECTOR).count() > 0) return true;
      }
      await page.waitForTimeout(600);
    }
    return false;
  };
  if (!await waitForTableReady()) {
    console.error('DOM table did not load.');
    await browser.close();
    return;
  }

  console.log('Starting DOM scraping (details)…');
  let currentPage = 1;

  // skip to checkpoint page …
  while (currentPage < (lastPageDone || 1)) {
    const disabled = await page.locator('#tendeList_paginate .next').getAttribute('class')
      .then(c => (c||'').includes('disabled')).catch(() => true);
    if (disabled) break;
    await page.locator(PAGINATE_NEXT_SEL).click().catch(() => {});
    await humanDelay(); await waitForTableReady();
    currentPage++;
    console.log(`Skipped to page ${currentPage}`);
  }

  const saveCheckpoint = (rowIndex) =>
    fs.writeFileSync(CHECKPOINT_FILE, JSON.stringify({ page: currentPage, rowIndex }, null, 2));
  const saveResults = () =>
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));

  let hasNextPage = true;
  while (hasNextPage) {
    await waitForTableReady();

    // Identify parent rows (skip the detail rows themselves if any)
    const allRows = page.locator(ROW_SELECTOR);
    const totalRows = await allRows.count();
    const parentIdx = [];
    for (let i = 0; i < totalRows; i++) {
      const cls = (await allRows.nth(i).getAttribute('class')) || '';
      if (!cls.includes('child')) parentIdx.push(i);
    }
    console.log(`Page ${currentPage}: ${parentIdx.length} tenders.`);

    // resume row
    let startIdx = 0;
    if (currentPage === lastPageDone) startIdx = Math.max(0, lastRowDone + 1);

    for (let pIdx = startIdx; pIdx < parentIdx.length; pIdx++) {
      const row = allRows.nth(parentIdx[pIdx]);
      const cells = row.locator('td');

      // Basic columns: [Category][Description][eSubmission][Advertised][Closing]
      const category = (await cells.nth(1).innerText().catch(() => '')).trim();
      const title = (await cells.nth(2).innerText().catch(() => '')).trim();
      const eSub   = (await cells.nth(3).innerText().catch(() => '')).trim();
      const advertised = (await cells.nth(4).innerText().catch(() => '')).trim();
      const closingRaw = (await cells.nth(5).innerText().catch(() => '')).trim();

      // Expand row for details
      let detailData = { text: '', anchors: [] };
      try {
        await cells.first().click({ timeout: 3000 });
        await page.waitForTimeout(800);
        detailData = await row.evaluate((node) => {
          const nextRow = node.nextElementSibling;
          if (!nextRow) return { text: '', anchors: [] };
          const txt = nextRow.innerText || '';
          const anchors = Array.from(nextRow.querySelectorAll('a[href]')).map(a => ({
            text: a.textContent.trim(), url: a.href
          }));
          return { text: txt, anchors };
        });
      } catch {
        // leave detailData empty if fail
      }

      // Parse the detail text for specific fields
      const dText = detailData.text || '';
      const tenderNoMatch     = dText.match(/Tender\\s*Number\\s*:\\s*([^\\n]+)/i);
      const buyerMatch        = dText.match(/Organ\\s*of\\s*State\\s*:\\s*([^\\n]+)/i)
                              || dText.match(/Department\\s*:\\s*([^\\n]+)/i)
                              || dText.match(/Buyer\\s*:\\s*([^\\n]+)/i);
      const tenderTypeMatch   = dText.match(/Tender\\s*Type\\s*:\\s*([^\\n]+)/i);
      const provinceMatch     = dText.match(/Province\\s*:\\s*([^\\n]+)/i);
      const datePublishedMatch= dText.match(/Date\\s*Published\\s*:\\s*([^\\n]+)/i);
      const closingDateMatch2 = dText.match(/Closing\\s*Date\\s*:\\s*([^\\n]+)/i);

      const record = {
        source: 'dom-details',
        tenderNumber: tenderNoMatch ? tenderNoMatch[1].trim() : null,
        title,
        category,
        advertisedDate: datePublishedMatch ? datePublishedMatch[1].trim() : (advertised || null),
        closingDate: closingDateMatch2 ? closingDateMatch2[1].trim() : (closingRaw || null),
        buyerName: buyerMatch ? buyerMatch[1].trim() : null,
        eSubmission: /yes|accept/i.test(eSub) ? 'Yes' : (eSub || null),
        tenderType: tenderTypeMatch ? tenderTypeMatch[1].trim() : null,
        province: provinceMatch ? provinceMatch[1].trim() : null,
        datePublished: datePublishedMatch ? datePublishedMatch[1].trim() : null,
        documentLinks: detailData.anchors || [],
      };

      // Collapse the detail row (click the same cell again)
      try {
        await cells.first().click({ timeout: 2000 });
        await page.waitForTimeout(300);
      } catch {}

      const key = `${(record.tenderNumber || '').toUpperCase()}|${record.title || ''}`;
      if (!seenKeys.has(key)) {
        results.push(record);
        seenKeys.add(key);
      }

      saveCheckpoint(pIdx);
      if (pIdx % 5 === 0) saveResults();
      await humanDelay();
    }

    saveResults();
    console.log(`Page ${currentPage} done. Total so far: ${results.length}.`);

    // Paginate
    const nextDisabled = await page
      .locator('#tendeList_paginate .next')
      .getAttribute('class')
      .then(c => (c || '').includes('disabled'))
      .catch(() => false);
    if (nextDisabled) break;

    let moved = false;
    const nextCandidates = [
      PAGINATE_NEXT_SEL,
      '#tendeList_next',
      'a.paginate_button.next',
      '#tendeList_paginate a:has-text("Next")',
      'text=Next',
    ];
    for (const sel of nextCandidates) {
      try {
        const loc = page.locator(sel).first();
        if (await loc.count()) {
          await loc.scrollIntoViewIfNeeded().catch(()=>{});
          await loc.click({ timeout: 2500, force: true });
          await humanDelay();
          await waitForTableReady();
          moved = true;
          break;
        }
      } catch {}
    }
    if (!moved) {
      console.warn('Could not move to next page, stopping.');
      break;
    }
    currentPage++;
    fs.writeFileSync(CHECKPOINT_FILE, JSON.stringify({ page: currentPage, rowIndex: -1 }, null, 2));
  }

  console.log(`Scraping completed. Total tenders scraped: ${results.length}. Saved → ${OUTPUT_FILE}`);
  await browser.close();
})();

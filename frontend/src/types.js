/**
 * @typedef {Object} ChecklistItem
 * @property {string} key      - Unique ID e.g. "sbd4"
 * @property {string} label    - Human-friendly name
 * @property {boolean} done    - Whether item is completed
 * @property {string} note     - Extra info/tips
 */

/**
 * @typedef {Object} Tender
 * @property {string} id
 * @property {string} title
 * @property {string} entity
 * @property {string} province
 * @property {string} sector
 * @property {string} category     - "RFQ" | "RFP"
 * @property {string} amount_band  - "<R200k" | "R200k–R1m" | ">R1m"
 * @property {string} closing_date - YYYY-MM-DD
 * @property {string} posted_date  - YYYY-MM-DD
 * @property {string} source_url
 */

/**
 * @typedef {Object} Report
 * @property {string} status   - e.g. "OK" | "RISK"
 * @property {Object} summary  - key stats (admin docs, technical, pricing)
 * @property {Array<string>} missing - list of missing docs
 */

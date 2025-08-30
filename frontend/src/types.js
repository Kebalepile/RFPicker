/**
 * @file Shared typedefs for TenderPick frontend.
 *       Keeps all object "shapes" in one place for consistency.
 */

/**
 * A single checklist item (e.g., SBD form, BBBEE, Tax).
 * @typedef {Object} ChecklistItem
 * @property {string} key   - Unique identifier (e.g., "sbd4", "bbee")
 * @property {string} label - Human-readable name
 * @property {boolean} done - Whether the doc is completed/provided
 * @property {string} note  - Extra info or tips
 */

/**
 * A tender record, scraped or entered by a user.
 * @typedef {Object} Tender
 * @property {string} id
 * @property {string} title
 * @property {string} entity     - Issuing department or SOE
 * @property {string} province   - Province (e.g., Gauteng)
 * @property {string} sector     - Category (e.g., ICT, Construction)
 * @property {string} category   - "RFQ" | "RFP"
 * @property {string} amount_band - "<R200k" | "R200k–R1m" | ">R1m"
 * @property {string} closing_date - ISO date string (YYYY-MM-DD)
 * @property {string} posted_date  - ISO date string (YYYY-MM-DD)
 * @property {string} source_url   - Link to official source
 */

/**
 * Compliance report generated from an uploaded RFQ/RFP.
 * @typedef {Object} Report
 * @property {string} status       - e.g. "OK" | "RISK"
 * @property {Object} summary      - Key stats (e.g. counts per category)
 * @property {string[]} missing    - List of missing document keys
 */

/**
 * User notification settings.
 * @typedef {Object} UserSettings
 * @property {string} waNumber         - WhatsApp number
 * @property {boolean} whatsappEnabled - Whether WA notifications are on
 * @property {boolean} smsEnabled      - Whether SMS notifications are on
 */

/**
 * A project = one tender being worked on.
 * @typedef {Object} Project
 * @property {string} id
 * @property {Tender} tender           - Linked tender (or custom RFQ)
 * @property {ChecklistItem[]} checklist - Documents required/provided
 * @property {Report} report           - Generated compliance report
 * @property {Date} createdAt
 */

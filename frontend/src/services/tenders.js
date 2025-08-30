/**
 * @file Tenders API: list and fetch tender details.
 * Endpoints:
 *  - GET /api/tenders
 *  - GET /api/tenders/:id
 */

/**
 * List tenders with filters and pagination.
 * @param {{sector?:string, province?:string, amount_band?:string, q?:string, page?:number, page_size?:number, closing_before?:string}} params
 * @return {Promise<{items: Array, total: number, page: number}>}
 */
export async function listTenders(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`/api/tenders?${qs}`);
  if (!res.ok) throw new Error("List tenders failed");
  return res.json();
}

/**
 * Fetch a single tender with doc summary.
 * @param {string} id
 * @return {Promise<{tender: object, requiredDocs: Array}>}
 */
export async function getTender(id) {
  const res = await fetch(`/api/tenders/${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error("Tender fetch failed");
  return res.json();
}

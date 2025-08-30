/**
 * @file Reports API: fetch compliance report for a project.
 * Endpoint: GET /api/reports/:projectId
 */

/**
 * Get a compliance report.
 * @param {string} projectId
 * @return {Promise<{status: string, summary: object, missing: Array}>}
 */
export async function getReport(projectId) {
  const res = await fetch(`/api/reports/${encodeURIComponent(projectId)}`);
  if (!res.ok) throw new Error("Report fetch failed");
  return res.json();
}

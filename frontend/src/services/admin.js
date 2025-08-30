/**
 * @file Admin API: usage analytics, quotas, etc. (future).
 * Endpoint: GET /api/admin/usage
 */

/**
 * Fetch usage analytics (admin).
 * @return {Promise<{users:number, scans:number, proSubs:number}>}
 */
export async function getUsage() {
  const res = await fetch("/api/admin/usage");
  if (!res.ok) throw new Error("Usage fetch failed");
  return res.json();
}

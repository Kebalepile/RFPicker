/**
 * @file DFY Consulting API: request “we do it for you” service.
 * Endpoint: POST /api/consulting/request
 */

/**
 * Request DFY service.
 * @param {{projectId?:string, service:'DFY', notes?:string}} payload
 * @return {Promise<{ticketId:string, status:'received'}>}
 */
export async function requestDFY(payload) {
  const res = await fetch("/api/consulting/request", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("DFY request failed");
  return res.json();
}

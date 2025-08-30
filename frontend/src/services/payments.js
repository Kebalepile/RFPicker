/**
 * @file Payments API: start checkout for subscriptions or DFY.
 * Endpoint: POST /api/payments/checkout
 */

/**
 * Start a checkout session.
 * @param {{plan:'starter'|'pro'|'dfy', metadata?:object}} payload
 * @return {Promise<{redirectUrl:string}>}
 */
export async function checkout(payload) {
  const res = await fetch("/api/payments/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("Checkout failed");
  return res.json();
}

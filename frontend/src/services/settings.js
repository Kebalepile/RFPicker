/**
 * @file Settings API: save notification preferences.
 * Endpoint: POST /api/settings/notifications
 */

/**
 * Save notification preferences.
 * @param {{whatsappEnabled:boolean, smsEnabled:boolean, waNumber:string}} payload
 * @return {Promise<{success: boolean}>}
 */
export async function saveNotifications(payload) {
  const res = await fetch("/api/settings/notifications", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("Save settings failed");
  return res.json();
}

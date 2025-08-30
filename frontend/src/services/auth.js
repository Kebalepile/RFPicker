/**
 * @file Auth API: OTP request/verify (no email).
 * Endpoints:
 *  - POST /api/auth/request-otp
 *  - POST /api/auth/verify-otp
 */

/**
 * Request an OTP to be sent to the phone.
 * @param {{phone:string}} payload
 * @return {Promise<{ok:boolean, channel:'sms'|'whatsapp'}>}
 */
export async function requestOtp(payload) {
  const res = await fetch("/api/auth/request-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("OTP request failed");
  return res.json();
}

/**
 * Verify an OTP and receive a token.
 * @param {{phone:string, otp:string}} payload
 * @return {Promise<{token:string}>}
 */
export async function verifyOtp(payload) {
  const res = await fetch("/api/auth/verify-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("OTP verify failed");
  return res.json();
}

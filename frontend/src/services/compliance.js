/**
 * @file Compliance API: scan RFQ/RFP PDFs and upload specific returnables.
 * Endpoints:
 *  - POST /api/compliance/scan
 *  - POST /api/compliance/upload/:docType
 */

/**
 * Upload a PDF and receive a checklist & score.
 * @param {File|Blob} file - RFQ/RFP PDF file.
 * @return {Promise<{checklist: Array, score: number, deadline?: string, projectId: string}>}
 */
export async function scan(file) {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/compliance/scan", { method: "POST", body: fd });
  if (!res.ok) throw new Error("Scan failed");
  return res.json();
}

/**
 * Upload a single missing document (e.g., "sbd4", "bbee").
 * @param {string} projectId
 * @param {string} docType - Server-expected key (e.g., "sbd61", "tax", "bbee").
 * @param {File|Blob} file
 * @return {Promise<{status: 'ok', updatedChecklist: Array}>}
 */
export async function uploadDoc(projectId, docType, file) {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(
    `/api/compliance/upload/${encodeURIComponent(
      docType
    )}?projectId=${encodeURIComponent(projectId)}`,
    {
      method: "POST",
      body: fd
    }
  );
  if (!res.ok) throw new Error("Upload failed");
  return res.json();
}

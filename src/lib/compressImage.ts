/**
 * Downscale + re-encode a photo entirely in the browser so a 12 MP phone
 * snapshot of handwritten working can be sent to the AI examiner.
 * Returns raw base64 (no data-URL prefix).
 */
export async function compressImage(
  file: File,
  opts: { maxEdge?: number; maxBytes?: number } = {},
): Promise<{ b64: string; mime: string }> {
  const maxEdge = opts.maxEdge ?? 1600;
  const maxBytes = opts.maxBytes ?? 1_400_000;

  const dataUrl = await readAsDataUrl(file);
  const img = await loadImage(dataUrl);

  const scale = Math.min(1, maxEdge / Math.max(img.width, img.height));
  const w = Math.max(1, Math.round(img.width * scale));
  const h = Math.max(1, Math.round(img.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    // Canvas unavailable — fall back to the original if it is small enough.
    const raw = stripPrefix(dataUrl);
    if (file.size <= maxBytes) return { b64: raw, mime: file.type || "image/jpeg" };
    throw new Error("Couldn't process that image on this device.");
  }
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(img, 0, 0, w, h);

  let quality = 0.82;
  let out = canvas.toDataURL("image/jpeg", quality);
  while (approxBytes(out) > maxBytes && quality > 0.4) {
    quality -= 0.12;
    out = canvas.toDataURL("image/jpeg", quality);
  }
  return { b64: stripPrefix(out), mime: "image/jpeg" };
}

function approxBytes(dataUrl: string) {
  return Math.round((dataUrl.length - dataUrl.indexOf(",") - 1) * 0.75);
}

function stripPrefix(dataUrl: string) {
  const comma = dataUrl.indexOf(",");
  return comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result ?? ""));
    r.onerror = () => reject(new Error("Couldn't read that image."));
    r.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("That file isn't a readable image."));
    img.src = src;
  });
}

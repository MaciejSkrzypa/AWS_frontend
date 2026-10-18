import { request } from "./client.js";

const MAX_UPLOAD_SIZE = 25 * 1024 * 1024;

export async function uploadMedia(file) {
  if (file.size < 1 || file.size > MAX_UPLOAD_SIZE) {
    throw new Error("Plik musi mieć rozmiar od 1 bajta do 25 MB.");
  }

  const upload = await request("/api/media/upload-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      filename: file.name,
      content_type: file.type,
    }),
  });
  const form = new FormData();
  Object.entries(upload.fields).forEach(([key, value]) => form.append(key, value));
  form.append("file", file);

  const response = await fetch(upload.upload_url, {
    method: "POST",
    body: form,
  });
  if (!response.ok) {
    throw new Error("Nie udało się przesłać załącznika do S3.");
  }
  return upload;
}

export async function fetchMedia(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Nie udało się pobrać załącznika z S3.");
  }
  return response.blob();
}

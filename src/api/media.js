import { request, requestBlob } from "./client.js";

export function uploadMedia(file) {
  const form = new FormData();
  form.append("file", file);
  return request("/api/media", { method: "POST", body: form });
}

export function fetchMedia(path) {
  return requestBlob(path);
}

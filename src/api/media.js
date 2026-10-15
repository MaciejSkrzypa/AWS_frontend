import { API_URL, request } from "./client.js";

export function uploadMedia(file) {
  const form = new FormData();
  form.append("file", file);
  return request("/api/media", { method: "POST", body: form });
}

export function mediaUrl(path) {
  return `${API_URL}${path}`;
}

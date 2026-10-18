import { getAccessToken } from "../auth.js";

export const API_URL =
  import.meta.env.VITE_API_URL ??
  (import.meta.env.DEV ? "http://localhost:8000" : "");

async function authorizedFetch(path, options) {
  const token = await getAccessToken();
  if (!token) {
    throw new Error("Sesja wygasła. Zaloguj się ponownie.");
  }

  const headers = new Headers(options?.headers);
  headers.set("Authorization", `Bearer ${token}`);
  return fetch(`${API_URL}${path}`, { ...options, headers });
}

async function throwResponseError(response) {
  const payload = await response.json().catch(() => ({}));
  throw new Error(payload.detail ?? "Nie udało się połączyć z serwerem.");
}

export async function request(path, options) {
  const response = await authorizedFetch(path, options);
  if (!response.ok) {
    await throwResponseError(response);
  }
  return response.json();
}

export async function requestBlob(path) {
  const response = await authorizedFetch(path);
  if (!response.ok) {
    await throwResponseError(response);
  }
  return response.blob();
}

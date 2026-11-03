import { request } from "./client.js";

export function triggerSlowRequest(delayMs) {
  const query = new URLSearchParams({ delay_ms: String(delayMs) });
  return request(`/api/demo/slow?${query}`);
}

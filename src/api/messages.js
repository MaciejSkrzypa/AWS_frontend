import { request } from "./client.js";

export function fetchMessages(roomId) {
  return request(`/api/rooms/${roomId}/messages`);
}

export function createMessage(roomId, { author, text, mediaId }) {
  return request(`/api/rooms/${roomId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      author,
      text,
      ...(mediaId ? { media_id: mediaId } : {}),
    }),
  });
}

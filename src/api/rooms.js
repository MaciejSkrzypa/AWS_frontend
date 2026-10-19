import { request } from "./client.js";

export function fetchRooms() {
  return request("/api/rooms");
}

export function createRoom(name) {
  return request("/api/rooms", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      topic: "Nowa przestrzeń na pomysły",
    }),
  });
}

export function joinRoom(code) {
  return request("/api/rooms/join", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });
}

import { useEffect, useRef, useState } from "react";
import { ArrowDown } from "lucide-react";
import { createMessage, fetchMessages } from "../api/messages.js";
import { uploadMedia } from "../api/media.js";
import { createRoom, fetchRooms, joinRoom } from "../api/rooms.js";
import ChatHeader from "../components/ChatHeader.jsx";
import ErrorBanner from "../components/ErrorBanner.jsx";
import MessageComposer from "../components/MessageComposer.jsx";
import MessageList from "../components/MessageList.jsx";
import RoomSidebar from "../components/RoomSidebar.jsx";

function mergeMessages(current, incoming) {
  const messagesById = new Map(current.map((message) => [message.id, message]));
  incoming.forEach((message) => messagesById.set(message.id, message));
  return [...messagesById.values()].sort(
    (left, right) =>
      new Date(left.created_at).getTime() - new Date(right.created_at).getTime(),
  );
}

export default function ChatView({ user, onSignOut }) {
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);
  const activeRoomId = activeRoom?.id;

  useEffect(() => {
    fetchRooms()
      .then((data) => {
        setRooms(data);
        setActiveRoom((current) => current ?? data[0] ?? null);
      })
      .catch((cause) => setError(cause.message));
  }, []);

  useEffect(() => {
    if (!activeRoomId) {
      setMessages([]);
      return undefined;
    }

    setMessages([]);
    let isActive = true;
    let requestPending = false;
    async function refreshMessages() {
      if (requestPending) return;
      requestPending = true;
      try {
        const incoming = await fetchMessages(activeRoomId);
        if (isActive) {
          setMessages((current) => mergeMessages(current, incoming));
        }
      } catch (cause) {
        if (isActive) setError(cause.message);
      } finally {
        requestPending = false;
      }
    }

    refreshMessages();
    const interval = window.setInterval(refreshMessages, 4000);
    return () => {
      isActive = false;
      window.clearInterval(interval);
    };
  }, [activeRoomId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(event) {
    event.preventDefault();
    if (!draft.trim() || !activeRoom || busy) return;
    setBusy(true);
    setError("");
    try {
      const created = await createMessage(activeRoom.id, {
        text: draft.trim(),
      });
      setMessages((current) => [...current, created]);
      setDraft("");
    } catch (cause) {
      setError(cause.message);
    } finally {
      setBusy(false);
    }
  }

  async function sendAttachment(file) {
    if (!activeRoom) return;
    setUploading(true);
    setError("");
    try {
      const media = await uploadMedia(file);
      const created = await createMessage(activeRoom.id, {
        text: "",
        mediaId: media.id,
      });
      setMessages((current) => [...current, created]);
    } catch (cause) {
      setError(cause.message);
    } finally {
      setUploading(false);
    }
  }

  async function addRoom(name) {
    setError("");
    try {
      const room = await createRoom(name);
      setRooms((current) => [...current, room]);
      setActiveRoom(room);
      return true;
    } catch (cause) {
      setError(cause.message);
      return false;
    }
  }

  async function enterRoom(code) {
    setError("");
    try {
      const room = await joinRoom(code);
      setRooms((current) =>
        current.some((item) => item.id === room.id) ? current : [...current, room],
      );
      setActiveRoom(room);
      return true;
    } catch (cause) {
      setError(cause.message);
      return false;
    }
  }

  return (
    <main className="app-shell">
      <RoomSidebar
        rooms={rooms}
        activeRoom={activeRoom}
        user={user}
        onSelectRoom={setActiveRoom}
        onCreateRoom={addRoom}
        onJoinRoom={enterRoom}
        onSignOut={() => onSignOut().catch((cause) => setError(cause.message))}
      />
      <section className="chat-panel">
        <ChatHeader room={activeRoom} />
        <ErrorBanner message={error} onDismiss={() => setError("")} />
        <MessageList messages={messages} bottomRef={bottomRef} />
        <MessageComposer
          room={activeRoom}
          draft={draft}
          busy={busy}
          uploading={uploading}
          onDraftChange={setDraft}
          onSend={sendMessage}
          onUpload={sendAttachment}
        />
      </section>
      <button
        className="jump-bottom"
        aria-label="Przewiń do najnowszych"
        onClick={() => bottomRef.current?.scrollIntoView({ behavior: "smooth" })}
      >
        <ArrowDown size={16} />
      </button>
    </main>
  );
}

import { useEffect, useRef, useState } from "react";
import { Activity, ArrowDown, Hash, LoaderCircle, Plus, UsersRound } from "lucide-react";
import { triggerSlowRequest } from "../api/monitoring.js";
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
  const [roomsLoaded, setRoomsLoaded] = useState(false);
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [monitoringTestRunning, setMonitoringTestRunning] = useState(false);
  const [monitoringTestResult, setMonitoringTestResult] = useState("");
  const [error, setError] = useState("");
  const bottomRef = useRef(null);
  const activeRoomId = activeRoom?.id;

  useEffect(() => {
    let isActive = true;
    async function refreshRooms() {
      try {
        const data = await fetchRooms();
        if (!isActive) return;
        setRooms(data);
        setActiveRoom((current) =>
          current ? data.find((room) => room.id === current.id) ?? current : data[0] ?? null,
        );
      } catch (cause) {
        if (isActive) setError(cause.message);
      } finally {
        if (isActive) setRoomsLoaded(true);
      }
    }

    refreshRooms();
    const interval = window.setInterval(refreshRooms, 4000);
    return () => {
      isActive = false;
      window.clearInterval(interval);
    };
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

  async function runMonitoringTest() {
    if (monitoringTestRunning) return;
    setMonitoringTestRunning(true);
    setMonitoringTestResult("");
    setError("");
    const results = await Promise.allSettled(
      Array.from({ length: 15 }, () => triggerSlowRequest(2500)),
    );
    const succeeded = results.filter((result) => result.status === "fulfilled").length;
    setMonitoringTestResult(
      `Wysłano ${succeeded}/15 żądań. Sprawdź alarm i metrykę ApiResponseTime w CloudWatch.`,
    );
    if (succeeded !== results.length) {
      setError("Nie wszystkie żądania testowe zakończyły się powodzeniem.");
    }
    setMonitoringTestRunning(false);
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
        showRoomForm={showRoomForm}
        showJoinForm={showJoinForm}
        setShowRoomForm={setShowRoomForm}
        setShowJoinForm={setShowJoinForm}
      />
      <section className="chat-panel">
        <ErrorBanner message={error} onDismiss={() => setError("")} />
        {activeRoom ? (
          <>
            <ChatHeader room={activeRoom} />
            <div className="monitoring-test">
              <button
                type="button"
                onClick={runMonitoringTest}
                disabled={monitoringTestRunning}
              >
                {monitoringTestRunning ? (
                  <LoaderCircle className="spin" size={14} />
                ) : (
                  <Activity size={14} />
                )}
                Test alarmu CloudWatch (15 żądań)
              </button>
              {monitoringTestResult && <span role="status">{monitoringTestResult}</span>}
            </div>
            <MessageList
              messages={messages}
              bottomRef={bottomRef}
              roomId={activeRoom.id}
            />
            <MessageComposer
              room={activeRoom}
              draft={draft}
              busy={busy}
              uploading={uploading}
              onDraftChange={setDraft}
              onSend={sendMessage}
              onUpload={sendAttachment}
            />
          </>
        ) : (
          <section className="no-room-state" aria-labelledby="no-room-title">
            <div className="no-room-icon"><Hash size={22} /></div>
            <p className="no-room-eyebrow">GATHER</p>
            <h1 id="no-room-title">
              {roomsLoaded ? "Wybierz miejsce na rozmowę" : "Ładowanie pokoi…"}
            </h1>
            {roomsLoaded && (
              <>
                <p className="no-room-description">
                  Dołącz do istniejącego pokoju albo stwórz nowy, aby zacząć rozmawiać.
                </p>
                <div className="no-room-actions">
                  <button
                    type="button"
                    onClick={() => {
                      setShowRoomForm(false);
                      setShowJoinForm(true);
                    }}
                  >
                    <UsersRound size={16} />
                    Dołącz do pokoju
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowJoinForm(false);
                      setShowRoomForm(true);
                    }}
                  >
                    <Plus size={16} />
                    Stwórz pokój
                  </button>
                </div>
              </>
            )}
          </section>
        )}
      </section>
      {activeRoom && (
        <button
          className="jump-bottom"
          aria-label="Przewiń do najnowszych"
          onClick={() => bottomRef.current?.scrollIntoView({ behavior: "smooth" })}
        >
          <ArrowDown size={16} />
        </button>
      )}
    </main>
  );
}

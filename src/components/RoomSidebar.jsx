import { useState } from "react";
import {
  ArrowUp,
  Hash,
  LogOut,
  Plus,
  Search,
  Sparkles,
  UsersRound,
} from "lucide-react";
import Avatar from "./Avatar.jsx";

export default function RoomSidebar({
  rooms,
  activeRoom,
  user,
  onSelectRoom,
  onCreateRoom,
  onJoinRoom,
  onSignOut,
}) {
  const [search, setSearch] = useState("");
  const [roomName, setRoomName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);

  async function submitRoom(event) {
    event.preventDefault();
    if (!roomName.trim()) return;
    const created = await onCreateRoom(roomName.trim());
    if (created) {
      setRoomName("");
      setShowRoomForm(false);
    }
  }

  async function submitJoin(event) {
    event.preventDefault();
    if (!roomCode.trim()) return;
    const joined = await onJoinRoom(roomCode.trim());
    if (joined) {
      setRoomCode("");
      setShowJoinForm(false);
    }
  }

  const visibleRooms = rooms.filter((room) =>
    room.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <aside className="sidebar">
      <a className="brand" href="#home" aria-label="Gather — strona główna">
        <span className="brand-mark"><Sparkles size={19} strokeWidth={2.2} /></span>
        <span>gather<span className="brand-period">.</span></span>
      </a>

      <div className="workspace-card">
        <div className="workspace-icon">S</div>
        <div className="workspace-details">
          <strong>Studio Północ</strong>
          <span>Przestrzeń zespołu</span>
        </div>
        <span className="workspace-menu">···</span>
      </div>

      <div className="sidebar-label-row">
        <span className="sidebar-label">Twoje pokoje</span>
        <button
          className="join-room-trigger"
          type="button"
          onClick={() => setShowJoinForm((visible) => !visible)}
        >
          <UsersRound size={14} />
          <span>Dołącz kodem</span>
        </button>
        <button
          className="icon-button add-room"
          aria-label="Dodaj pokój"
          onClick={() => setShowRoomForm((visible) => !visible)}
        >
          <Plus size={16} />
        </button>
      </div>
      <label className="search-box">
        <Search size={15} />
        <input
          aria-label="Szukaj pokoju"
          placeholder="Szukaj pokoju"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <kbd>⌘ K</kbd>
      </label>

      {showRoomForm && (
        <form className="room-create" onSubmit={submitRoom}>
          <input
            autoFocus
            maxLength={60}
            placeholder="Nazwa pokoju"
            value={roomName}
            onChange={(event) => setRoomName(event.target.value)}
          />
          <button type="submit" aria-label="Utwórz pokój">
            <ArrowUp size={15} />
          </button>
        </form>
      )}

      {showJoinForm && (
        <form className="room-join" onSubmit={submitJoin}>
          <input
            autoFocus
            maxLength={12}
            placeholder="Kod pokoju"
            aria-label="Kod pokoju"
            value={roomCode}
            onChange={(event) => setRoomCode(event.target.value.toUpperCase())}
          />
          <button type="submit" aria-label="Dołącz do pokoju">
            <ArrowUp size={15} />
          </button>
        </form>
      )}

      <nav className="room-list" aria-label="Pokoje">
        {visibleRooms.map((room) => (
          <button
            className={`room-link${activeRoom?.id === room.id ? " room-active" : ""}`}
            key={room.id}
            onClick={() => onSelectRoom(room)}
          >
            <Hash size={16} strokeWidth={1.8} />
            <span>{room.name}</span>
            {room.id === "general" && <span className="room-unread" />}
          </button>
        ))}
        {visibleRooms.length === 0 && <p className="empty-rooms">Brak pokoi</p>}
        <button
          className="mobile-join-trigger"
          type="button"
          aria-label="Dołącz do pokoju kodem"
          onClick={() => setShowJoinForm((visible) => !visible)}
        >
          <UsersRound size={17} />
        </button>
      </nav>

      <div className="sidebar-spacer" />
      <div className="sidebar-note">
        <div className="note-icon"><Sparkles size={15} /></div>
        <p>Małe rozmowy.<br /><strong>Wielkie pomysły.</strong></p>
        <span>Witaj w Gather</span>
      </div>
      <div className="profile">
        <Avatar name={user.email} />
        <div className="profile-details">
          <strong>{user.email}</strong>
          <span>Konto Cognito</span>
        </div>
        <button
          aria-label="Wyloguj"
          className="sign-out-button"
          onClick={onSignOut}
          type="button"
        >
          <LogOut size={14} />
          <span>Wyloguj</span>
        </button>
      </div>
    </aside>
  );
}

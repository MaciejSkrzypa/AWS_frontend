import { CalendarDays, Hash, UsersRound } from "lucide-react";

function participantLabel(count) {
  const plural = new Intl.PluralRules("pl").select(count);
  const label = plural === "one" ? "osoba" : plural === "few" ? "osoby" : "osób";
  return `${count} ${label}`;
}

export default function ChatHeader({ room }) {
  const createdDate = room
    ? new Intl.DateTimeFormat("pl-PL", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(new Date(room.created_at))
    : null;

  return (
    <header className="chat-header">
      <div className="room-heading">
        <div className="room-heading-icon"><Hash size={17} /></div>
        <div className="room-heading-details">
          <h1>{room?.name ?? "Gather"}</h1>
          {createdDate && (
            <span className="room-created">
              <CalendarDays size={13} aria-hidden="true" />
              <time dateTime={room.created_at}>{createdDate}</time>
            </span>
          )}
        </div>
      </div>
      <div className="header-actions">
        {room && (
          <div className="room-code" aria-label={`Kod pokoju ${room.id}`}>
            <span>KOD POKOJU</span>
            <code>{room.id}</code>
          </div>
        )}
        {room && (
          <span className="member-count" aria-label={participantLabel(room.member_count)}>
            <UsersRound size={17} aria-hidden="true" />
            <span>{room.member_count}</span>
          </span>
        )}
      </div>
    </header>
  );
}

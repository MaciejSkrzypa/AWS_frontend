import { Hash, Users } from "lucide-react";
import Avatar from "./Avatar.jsx";

export default function ChatHeader({ room }) {
  return (
    <header className="chat-header">
      <div className="room-heading">
        <div className="room-heading-icon"><Hash size={17} /></div>
        <div>
          <h1>{room?.name ?? "Gather"}</h1>
          <p>{room?.topic ?? "Wybierz pokój, aby rozpocząć rozmowę"}</p>
        </div>
      </div>
      <div className="header-actions">
        <div className="member-stack" aria-label="3 członków online">
          <Avatar name="Maja" small />
          <Avatar name="Kuba" small />
          <Avatar name="Ola" small />
        </div>
        <span className="member-count"><Users size={15} /> 3</span>
        <span className="header-divider" />
        <button className="icon-button header-more" aria-label="Więcej opcji">···</button>
      </div>
    </header>
  );
}

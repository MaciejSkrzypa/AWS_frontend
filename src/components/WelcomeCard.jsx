import { Hash, Users } from "lucide-react";

export default function WelcomeCard() {
  return (
    <div className="welcome-card">
      <div className="welcome-icon"><Hash size={22} /></div>
      <div className="welcome-eyebrow"><span /> POKÓJ OTWARTY</div>
      <h2>To początek czegoś dobrego.</h2>
      <p>Wszystko, co ważne dla zespołu, zaczyna się od rozmowy.</p>
      <div className="welcome-meta">
        <Users size={14} /> 3 osoby w tym pokoju <span>·</span> Utworzono dzisiaj
      </div>
    </div>
  );
}

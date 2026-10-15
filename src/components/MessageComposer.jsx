import { useRef } from "react";
import {
  AudioLines,
  Image,
  LoaderCircle,
  Plus,
  Send,
  Smile,
  Video,
} from "lucide-react";

export default function MessageComposer({
  room,
  draft,
  busy,
  uploading,
  onDraftChange,
  onSend,
  onUpload,
}) {
  const fileRef = useRef(null);

  function selectFile(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) onUpload(file);
  }

  return (
    <div className="composer-wrap">
      <form className="composer" onSubmit={onSend}>
        <input
          ref={fileRef}
          className="visually-hidden"
          type="file"
          accept="image/*,audio/*,video/*"
          onChange={selectFile}
        />
        <button
          type="button"
          className="composer-plus"
          aria-label="Dodaj załącznik"
          disabled={uploading || !room}
          onClick={() => fileRef.current?.click()}
        >
          {uploading ? <LoaderCircle className="spin" size={19} /> : <Plus size={19} />}
        </button>
        <input
          aria-label="Treść wiadomości"
          placeholder={`Napisz coś na #${room?.name ?? "..."}`}
          value={draft}
          maxLength={2000}
          onChange={(event) => onDraftChange(event.target.value)}
          disabled={!room}
        />
        <div className="composer-tools">
          <button type="button" aria-label="Dodaj obraz" onClick={() => fileRef.current?.click()}>
            <Image size={17} />
          </button>
          <button type="button" aria-label="Dodaj wideo" onClick={() => fileRef.current?.click()}>
            <Video size={17} />
          </button>
          <button type="button" aria-label="Dodaj audio" onClick={() => fileRef.current?.click()}>
            <AudioLines size={17} />
          </button>
          <button type="button" aria-label="Emoji"><Smile size={17} /></button>
          <button
            className="send-button"
            type="submit"
            aria-label="Wyślij wiadomość"
            disabled={!draft.trim() || busy || !room}
          >
            {busy ? <LoaderCircle className="spin" size={16} /> : <Send size={16} />}
          </button>
        </div>
      </form>
      <div className="composer-hint">
        <span><kbd>↵</kbd> aby wysłać</span>
        <span>Rozmawiaj z życzliwością ✳</span>
      </div>
    </div>
  );
}

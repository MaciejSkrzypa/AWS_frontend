import { X } from "lucide-react";

export default function ErrorBanner({ message, onDismiss }) {
  if (!message) return null;

  return (
    <div className="error-banner" role="alert">
      <span>{message}</span>
      <button aria-label="Zamknij komunikat" onClick={onDismiss}>
        <X size={15} />
      </button>
    </div>
  );
}

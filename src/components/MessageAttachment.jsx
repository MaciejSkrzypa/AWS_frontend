import { useEffect, useState } from "react";
import { fetchMedia, getMediaDownloadUrl } from "../api/media.js";

export default function MessageAttachment({ media, roomId }) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [originalUrl, setOriginalUrl] = useState("");
  const [openingOriginal, setOpeningOriginal] = useState(false);

  const isImage = media.content_type.startsWith("image/");

  useEffect(() => {
    if (isImage) return undefined;

    let active = true;
    let objectUrl;

    fetchMedia(media.url)
      .then((blob) => {
        objectUrl = URL.createObjectURL(blob);
        if (active) setUrl(objectUrl);
        else URL.revokeObjectURL(objectUrl);
      })
      .catch((cause) => {
        if (active) setError(cause.message);
      });

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [isImage, media.url]);

  async function openOriginal() {
    setOpeningOriginal(true);
    setError("");
    try {
      const result = await getMediaDownloadUrl(roomId, media.id);
      setOriginalUrl(result.url);
    } catch (cause) {
      setError(cause.message);
    } finally {
      setOpeningOriginal(false);
    }
  }

  if (isImage) {
    return (
      <>
        {media.thumbnail_url ? (
          <button
            className="image-attachment"
            type="button"
            onClick={openOriginal}
            disabled={openingOriginal}
            aria-label={`Otwórz pełny obraz: ${media.filename}`}
          >
            <img src={media.thumbnail_url} alt={media.filename} />
          </button>
        ) : (
          <button
            className="image-attachment-placeholder"
            type="button"
            onClick={openOriginal}
            disabled={openingOriginal}
          >
            {openingOriginal
              ? "Otwieranie obrazu…"
              : ["pending", "processing"].includes(media.thumbnail_status)
                ? "Tworzenie miniatury…"
                : "Otwórz oryginalny obraz"}
          </button>
        )}
        {error && <p className="attachment-error" role="alert">{error}</p>}
        {originalUrl && (
          <div
            className="image-preview-overlay"
            role="dialog"
            aria-modal="true"
            aria-label={media.filename}
            onClick={() => setOriginalUrl("")}
          >
            <button
              className="image-preview-close"
              type="button"
              onClick={() => setOriginalUrl("")}
              aria-label="Zamknij podgląd"
            >
              Zamknij
            </button>
            <img
              src={originalUrl}
              alt={media.filename}
              onClick={(event) => event.stopPropagation()}
            />
          </div>
        )}
      </>
    );
  }

  if (error) return <p className="attachment-error" role="alert">{error}</p>;
  if (!url) return <p className="attachment-loading">Pobieranie załącznika…</p>;

  if (media.content_type.startsWith("video/")) {
    return <video className="media-player" src={url} controls />;
  }

  return (
    <audio className="media-player" src={url} controls>
      Twoja przeglądarka nie obsługuje odtwarzania audio.
    </audio>
  );
}

import { useEffect, useState } from "react";
import { fetchMedia } from "../api/media.js";

export default function MessageAttachment({ media }) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
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
  }, [media.url]);

  if (error) return <p className="attachment-error" role="alert">{error}</p>;
  if (!url) return <p className="attachment-loading">Pobieranie załącznika…</p>;

  if (media.content_type.startsWith("image/")) {
    return (
      <a className="image-attachment" href={url} target="_blank" rel="noreferrer">
        <img src={url} alt={media.filename} />
      </a>
    );
  }

  if (media.content_type.startsWith("video/")) {
    return <video className="media-player" src={url} controls />;
  }

  return (
    <audio className="media-player" src={url} controls>
      Twoja przeglądarka nie obsługuje odtwarzania audio.
    </audio>
  );
}

import { mediaUrl } from "../api/media.js";

export default function MessageAttachment({ media }) {
  const url = mediaUrl(media.url);

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

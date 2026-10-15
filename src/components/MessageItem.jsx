import Avatar from "./Avatar.jsx";
import MessageAttachment from "./MessageAttachment.jsx";
import formatTime from "../utils/formatTime.js";

export default function MessageItem({ message, previousMessage }) {
  const grouped = previousMessage?.author === message.author;

  return (
    <article className={`message${grouped ? " message-grouped" : ""}`}>
      <div className="message-avatar">
        {!grouped && <Avatar name={message.author} small />}
      </div>
      <div className="message-body">
        {!grouped && (
          <div className="message-heading">
            <span className="message-author">{message.author}</span>
            <time>{formatTime(message.created_at)}</time>
          </div>
        )}
        {message.text && <p>{message.text}</p>}
        {message.media && <MessageAttachment media={message.media} />}
      </div>
    </article>
  );
}

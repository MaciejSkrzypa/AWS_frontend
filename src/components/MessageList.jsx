import MessageItem from "./MessageItem.jsx";
import WelcomeCard from "./WelcomeCard.jsx";

export default function MessageList({ messages, bottomRef }) {
  return (
    <div className="messages-scroll">
      <WelcomeCard />
      <div className="date-divider"><span /> <span>DZISIAJ</span> <span /></div>
      <div className="message-list" aria-live="polite">
        {messages.map((message, index) => (
          <MessageItem
            key={message.id}
            message={message}
            previousMessage={messages[index - 1]}
          />
        ))}
        {messages.length === 0 && (
          <div className="empty-state">Jeszcze cicho. Napisz pierwszą wiadomość ✨</div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

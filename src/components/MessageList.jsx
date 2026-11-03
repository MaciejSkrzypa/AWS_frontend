import MessageItem from "./MessageItem.jsx";

export default function MessageList({ messages, bottomRef, roomId }) {
  return (
    <div className="messages-scroll">
      <div className="date-divider"><span /> <span>DZISIAJ</span> <span /></div>
      <div className="message-list" aria-live="polite">
        {messages.map((message, index) => (
          <MessageItem
            key={message.id}
            message={message}
            previousMessage={messages[index - 1]}
            roomId={roomId}
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

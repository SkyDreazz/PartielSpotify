import React, { useState } from "react";

export function ChatBoxMessage() {
  const [messages, setMessages] = useState<{ user: string; text: string }[]>([]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (input.trim() !== "") {
      setMessages([...messages, { user: "Moi", text: input }]);
      setInput("");
    }
  };

  return (
    <div className="chat-box">
      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index} className="message">
            <strong>{msg.user}: </strong> {msg.text}
          </div>
        ))}
      </div>

      <div className="chat-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Écris un message..."
        />
        <button onClick={sendMessage}>Envoyer</button>
      </div>
    </div>
  );
}

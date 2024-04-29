import React, { useState, useEffect, useRef } from 'react';
import './Chat.css';

function Chat({ messages, onSendMessage }) {
  const [message, setMessage] = useState('');
  const chatMessagesRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const onScroll = () => {
    const { scrollTop, scrollHeight, clientHeight } = chatMessagesRef.current;
    const atBottom = scrollTop + clientHeight >= scrollHeight - 10;
    setIsAtBottom(atBottom);
  };

  const scrollToBottom = () => {
    if (chatMessagesRef.current && isAtBottom) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]); // Asegúrate de que esta dependencia está correcta
  
  

  const sendMessage = (event) => {
    event.preventDefault();
    if (message.trim() !== '') {
      onSendMessage(message);  // Llama a handleSendMessage pasando el mensaje
      setMessage('');
      setIsAtBottom(true);
    }
  };
  

  return (
    <div className="chat-container">
      <h2>Chat</h2>
      <div className="chat-messages" onScroll={onScroll} ref={chatMessagesRef}>
        {messages.map((msg, index) => (
          <div key={index} className="chat-message">
            {msg.name}: {msg.content} - {new Date(msg.timestamp).toLocaleString()}
          </div>
        ))}
      </div>

      <form className="chat-input" onSubmit={sendMessage}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button type="submit">Enviar</button>
      </form>
    </div>
  );
}

export default Chat;

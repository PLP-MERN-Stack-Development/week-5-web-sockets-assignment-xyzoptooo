import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from './socket/socket';

const ChatRoom = ({ username, onLogout }) => {
  const {
    messages,
    users,
    typingUsers,
    sendMessage,
    sendPrivateMessage,
    setTyping,
    isConnected,
  } = useSocket();

  const [message, setMessage] = useState('');
  const [privateTo, setPrivateTo] = useState('');
  const [loadedMessages, setLoadedMessages] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loadedMessages]);

  // Fetch previous messages on mount
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch('/api/messages');
        if (response.ok) {
          const data = await response.json();
          setLoadedMessages(data);
        } else {
          console.error('Failed to fetch messages');
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
  }, []);

  // Merge loadedMessages and real-time messages, avoiding duplicates
  const allMessages = [...loadedMessages];
  messages.forEach((msg) => {
    if (!allMessages.find((m) => m.id === msg.id)) {
      allMessages.push(msg);
    }
  });


  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    if (privateTo) {
      sendPrivateMessage(privateTo, message.trim());
    } else {
      sendMessage(message.trim());
    }
    setMessage('');
    setTyping(false);
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);
    setTyping(e.target.value.length > 0);
  };

  return (
    <div className="chat-room">
      <div className="chat-header">
        <h2>Welcome, {username}</h2>
        <button onClick={onLogout}>Logout</button>
      </div>

      <div className="chat-users">
        <h3>Users Online</h3>
        <ul>
          {users.map((user) => (
            <li key={user.id}>
              {user.username} {privateTo === user.id && '(Private)'}
              <button onClick={() => setPrivateTo(user.id)}>PM</button>
            </li>
          ))}
          {privateTo && (
            <li>
              <button onClick={() => setPrivateTo('')}>Clear Private</button>
            </li>
          )}
        </ul>
      </div>

      <div className="chat-messages" style={{ height: '300px', overflowY: 'auto' }}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              backgroundColor: msg.system ? '#eee' : msg.senderId === username ? '#daf8cb' : '#fff',
              padding: '5px',
              margin: '5px 0',
              borderRadius: '5px',
            }}
          >
            {!msg.system && (
              <div>
                <strong>{msg.sender}</strong> <em>{new Date(msg.timestamp).toLocaleTimeString()}</em>
              </div>
            )}
            <div>{msg.message}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="typing-indicator">
        {typingUsers.length > 0 && (
          <div>{typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...</div>
        )}
      </div>

      <form onSubmit={handleSendMessage}>
        <input
          type="text"
          placeholder={privateTo ? 'Private message' : 'Type a message'}
          value={message}
          onChange={handleTyping}
          autoFocus
        />
        <button type="submit" disabled={!isConnected}>Send</button>
      </form>
    </div>
  );
};

export default ChatRoom;

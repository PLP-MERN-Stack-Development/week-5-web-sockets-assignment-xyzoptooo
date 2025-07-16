import React, { useState } from 'react';
import Login from './Login';
import ChatRoom from './ChatRoom';
import { useSocket } from './socket/socket';
import './styles.css';

const App = () => {
  const [username, setUsername] = useState('');
  const { connect, disconnect, isConnected } = useSocket();

  const handleLogin = (name) => {
    setUsername(name);
    connect(name);
  };

  const handleLogout = () => {
    disconnect();
    setUsername('');
  };

  return (
    <div>
      {!username ? (
        <Login onLogin={handleLogin} />
      ) : (
        <ChatRoom username={username} onLogout={handleLogout} />
      )}
    </div>
  );
};

export default App;

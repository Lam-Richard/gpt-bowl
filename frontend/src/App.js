import { useState, useEffect } from 'react';
import openSocket from 'socket.io-client';

const socket = openSocket('http://localhost:3000', {rejectUnauthorized: false, transports: ['websocket']});

function App() {
  const [name, setName] = useState("Initial Value");
  const [roomCode, setRoomCode] = useState('');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    console.log("Can you not print...!??!!")
    socket.on('message', (message) => {
      setMessages([...messages, message]);
    });
  }, [messages]);

  const joinRoom = () => {
    console.log("Joined room...!");
    socket.emit('joinRoom', roomCode);
  };

  const sendMessage = () => {
    socket.emit('message', `From ${name}: ${newMessage}`, roomCode);
    setNewMessage('');
    console.log("Sent new message...!");
  };

  return (
    <div>
      <div>Name: </div>
      <input value={name} onChange={(e) => setName(e.target.value)}></input>

      <input value={roomCode} onChange={(e) => setRoomCode(e.target.value)}></input>
      <button onClick={() => joinRoom()}>Join Room!</button>

      <input value={newMessage} onChange={(e) => setNewMessage(e.target.value)}></input>
      <button onClick={() => sendMessage()}>Send Message</button>

      <div>
        <ul>
        {messages.map(message => <li>{message}</li>)}
        </ul>
      </div>

    </div>
  );
}

export default App;

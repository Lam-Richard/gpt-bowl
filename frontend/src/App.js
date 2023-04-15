import { useState, useEffect } from 'react';
import openSocket from 'socket.io-client';
import "./App.css";

const socket = openSocket('http://localhost:3000', {rejectUnauthorized: false, transports: ['websocket']});

document.addEventListener('keydown', (event) => {
  if (event.key === "Enter") {
    alert("Hi");
  }
})

function App() {
  const [name, setName] = useState("Initial Value");
  const [roomCode, setRoomCode] = useState('200');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [newGuess, setNewGuess] = useState('');

  const [questions, setQuestions] = useState([]);

  const joinRoom = () => {
    console.log("Joined room...!");
    socket.emit('joinRoom', roomCode);
  };

  useEffect(() => {
    joinRoom();

  }, [])

  const nextQuestion = () => {
    socket.emit("nextQuestion");
  }

  useEffect(() => {
    socket.on('message', (message) => {
      setMessages([...messages, message]);
    });
  }, [messages]);





  const sendMessage = () => {
    socket.emit('message', `From ${name}: ${newMessage}`, roomCode);
    setNewMessage('');
    console.log("Sent new message...!");
  };

  // return (
  //   <div>
  //     <div>Name: </div>
  //     <input value={name} onChange={(e) => setName(e.target.value)}></input>

  //     <input value={roomCode} onChange={(e) => setRoomCode(e.target.value)}></input>
  //     <button onClick={() => joinRoom()}>Join Room!</button>

  //     <input value={newMessage} onChange={(e) => setNewMessage(e.target.value)}></input>
  //     <button onClick={() => sendMessage()}>Send Message</button>

  //     <div>
  //       <ul>
  //       {messages.map(message => <li>{message}</li>)}
  //       </ul>
  //     </div>

  //   </div>
  // );
  return (
    <div className="grid-container">
      <div className="main">
        <div className="guessbar">
          <div>Guess: &nbsp;</div>
          <input 
            value={newGuess} 
            onEnter={() => setNewGuess('')} 
            onChange={(e) => {setNewGuess(e.target.value)}} 
            >
          </input>
        </div>
        {/* Log should be scrollable in the future */}
        <div className="log">
          <div className="current"></div>
          <div className="current"></div>

        </div>
      </div>
      <div className="side"></div>
    </div>
  )
}

export default App;

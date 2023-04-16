import { useState, useEffect } from 'react';
import openSocket from 'socket.io-client';
import "./App.css";
import QuizBowlQuestion from './Components/QuizBowlQuestion'
// import { BrowserRouter, Route, Routes } from 'react-router-dom';

const socket = openSocket('http://localhost:3000', {rejectUnauthorized: false, transports: ['websocket']});

function App() {

  function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }

  const roomCode = 200;
  const id = generateRandomString(10);
  const [guess, setGuess] = useState('');
  const [questions, setQuestions] = useState([]);
  const [canGuess, setCanGuess] = useState(false);
  const [timer, setTimer] = useState(20);

  const joinRoom = () => {
    console.log(`${id} Joined room ${roomCode}...!`);
    socket.emit('joinRoom', {roomCode: roomCode, id: id});
  };

  useEffect(() => {
    console.log("Guesses: ", guess);
  }, [guess]);
  
  useEffect(() => {
    console.log("Questions: ", questions);
  }, [questions]);

  useEffect(() => {
    joinRoom();
    socket.on('confirmBuzz', (payload) => {
      if (payload.id == id) {
        setCanGuess(true);  
      }
    })
  }, []);


  useEffect(() => {
    if (canGuess) {
      setTimeout(() => {
        setInterval(setTimer(timer - 1), 1000);
      }, 20000)
    }
    setTimer(20);
    setCanGuess(false);
  }, [canGuess])

  useEffect(() => {
    socket.on('postNextQuestion', (q_a) => {
      setQuestions([q_a, ...questions]);
    })
  }, [questions])


  const nextQuestion = (payload) => {
    socket.emit("getNextQuestion", payload);
  }

  const sendBuzz = (payload) => {
    socket.emit('sendBuzz', payload);
  }




  return (

    <div className="grid-container">
      <div className="main">
        <div className="guessbar">
          <button 
            style={{height: "25px", width: "50px"}}
            onClick={() => {
              console.log("Clicking...");
              nextQuestion({roomCode: roomCode})
            }
            }>
            New
          </button>

          <button 
            style={{height: "25px", width: "50px"}}
            onClick={() => {
              console.log("Clicking...");
              sendBuzz({roomCode: roomCode, id: generateRandomString(10)})
            }
            }>
            Buzz
          </button>


          <input 
            value={guess} 
            onEnter={() => setGuess('')} 
            onChange={(e) => {setGuess(e.target.value)}} 
            >
          </input>

          <button 
            style={{height: "25px", width: "50px"}}
            onClick={() => {
              if (canGuess) {
                console.log("Send my Guess in! This should be a key listener though...");
              } else {
                console.log("Can't Guess")
              }
            }
            }>
            Guess
          </button>

          <button 
            style={{height: "25px", width: "160px"}}>
            Remaining Time: {timer}
          </button>
         

        </div>
        {/* Log should be scrollable in the future */}
        <div className="log">
          {questions.map(q_a => <div key={q_a.answer} className="current">{q_a.question}</div>)}
        </div>
      </div>
      <div className="side"></div>
    </div>
  )
}

export default App;


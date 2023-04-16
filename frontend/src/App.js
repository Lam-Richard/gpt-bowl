import { useState, useEffect } from 'react';
import openSocket from 'socket.io-client';
import "./App.css";
import QuizBowlQuestion from './Components/QuizBowlQuestion'
// import { BrowserRouter, Route, Routes } from 'react-router-dom';


function generateRandomString(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

const socket = openSocket('http://localhost:3000', {rejectUnauthorized: false, transports: ['websocket']});
const id = generateRandomString(10);


function App() {


  const roomCode = 200;
  const [guess, setGuess] = useState('');
  const [questions, setQuestions] = useState([]);
  const [canGuess, setCanGuess] = useState(false);
  const [timer, setTimer] = useState(10);
  const [scroll, setScroll] = useState(true);
  const [correct, setCorrect] = useState(false);
  const [answered, setAnswered] = useState(false);

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
  }, []);

  useEffect(() => {
    socket.on('confirmBuzz', (payload) =>  {
      console.log("Payload id: ", payload.id);
      console.log("My id: ", id);
      if (payload.id == id) {
        console.log("True!")
        setScroll(false);
        console.log("Cannot scroll!");
        setCanGuess(true);  
      }
    })
  }, [canGuess])

  useEffect(() => {
    socket.on('result', (payload) => {
      console.log("isCorrect", payload.isCorrect)
      if (payload.isCorrect) {
        setCorrect(true)
        console.log("Set to Correct")
      }
      else {
        setCorrect(false)
        console.log("Set to Wrong")
      }
    })
  })


  useEffect(() => {
    if (canGuess) {
      const interval = setInterval(() => {
        setTimer(timer - 1);
        if (timer == 0) {
          clearInterval(interval);
          setCanGuess(false);
        }
      }, 1000);
      return;
    } else if (timer != 10) {
      setTimer(10);
      return;
    }
  }, [canGuess, timer])

  useEffect(() => {
    console.log("Timer useEffect: ", timer);
  }, [timer])

  useEffect(() => {
    socket.on('postNextQuestion', (q_a) => {
      setQuestions([q_a, ...questions]);
    })
  }, [questions])

  useEffect(() => {
      socket.on('startScroll', (payload) => {
        setScroll(true)
        console.log("Can scroll now!");
    })
  })

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
              sendBuzz({roomCode: roomCode, id: id})
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
                setAnswered(true)
                console.log("Send my Guess in! This should be a key listener though...");
                socket.emit('makeGuess', {id: id, guess: guess})
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
        <div style={{height: "25px", display: "flex", justifyContent: "center", marginTop: "15px"}}>
            {answered ?
              (correct ? 
                <h2>Correct!</h2> : 
                <h2>Wrong</h2>) :
              ""
            }
            
        </div>
          {questions.map(q_a =>
            <QuizBowlQuestion key={q_a.answer} question={q_a.question} scroll={scroll} setScroll={setScroll} />
          )}
        </div>
        
      </div>
      <div className="side"></div>
    </div>
  )
}

export default App;

import { useState, useEffect } from 'react';
import openSocket from 'socket.io-client';
import "./App.css";
import QuizBowlQuestion from './Components/QuizBowlQuestion'
import Heading from './Components/Heading'
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';


// import { BrowserRouter, Route, Routes } from 'react-router-dom';

// Import the functions you need from the SDKs you need


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
  const [timer, setTimer] = useState(20);
  const [scroll, setScroll] = useState(true);
  const [correct, setCorrect] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [currentBuzzes, setCurrentBuzzes] = useState([]);


  const joinRoom = () => {
    console.log(`${id} Joined room ${roomCode}...!`);
    socket.emit('joinRoom', {roomCode: roomCode, id: id});
  };

  useEffect(() => {
    console.log("Guesses: ", guess);
  }, [guess]);
  

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
  }, [canGuess]);

  useEffect(() => {
    socket.on('confirmGuess', (payload) => {

      console.log("isCorrect", payload.isCorrect)
      if (payload.isCorrect) {
        setCorrect(true)
        console.log("Set to Correct")
      }
      else {
        setCorrect(false)
        console.log("Set to Wrong")
      }

      setCurrentBuzzes([{message: `}${payload.id}: ${payload.guess} (${payload.isCorrect})`}, ...currentBuzzes]);
    })
  }, [correct, currentBuzzes])

  useEffect(() => {
    if (correct) {
      nextQuestion({roomCode: roomCode});
      setCorrect(false);
    }
  }, [correct])


  useEffect(() => {
    console.log("Current Buzzes: ", currentBuzzes);
  }, [currentBuzzes])

  useEffect(() => {
    socket.on("timer", (payload) => {
      setTimer(10 - payload.time)
      if (timer == 0) {
        setCanGuess(false);
      }
    })
  }, [canGuess, timer])

  useEffect(() => {
    console.log("Timer useEffect: ", timer);
  }, [timer])

  useEffect(() => {
    socket.on('postNextQuestion', (q_a) => {
      setQuestions([q_a, ...questions]);
      setCurrentBuzzes([]);
    })
  }, [questions, currentBuzzes])

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

  const handleTimerChange = (newTimer) => {
    setTimer(newTimer);
  }

  return (

    <div className="grid-container">
      <div className="main">
      <Heading/>
        <div className="guessbar">
          <Button 
            style={{height: "25px", width: "50px"}}
            onClick={() => {
              console.log("Clicking...");
              nextQuestion({roomCode: roomCode})
            }
            }>
            New
          </Button>

          <Button 
            style={{height: "25px", width: "50px"}}
            onClick={() => {
              console.log("Clicking...");
              if (questions.length > 0) {
                sendBuzz({roomCode: roomCode, id: id})
              }
            }
            }>
            Buzz
          </Button>


          <input
            value={guess} 
            onEnter={() => setGuess('')} 
            onChange={(e) => {setGuess(e.target.value)}}
            >
          </input>

          <Button 
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
          </Button>

          <Typography 
            style={{height: "25px", width: "160px"}}>
            Remaining Time: {timer}
          </Typography>
         

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
          {questions.map((q_a, index) =>
            {
              console.log("Index: ", index);
              if (index == 0) {
                return ( 
                  <div>
                    <QuizBowlQuestion key={q_a.answer} question={q_a.question} scroll={scroll} setScroll={setScroll}  time={timer} handleTimerChange={handleTimerChange}/>
                    {currentBuzzes.map(buzz => <div>{buzz.message}</div>)}
                  </div>
                )
              } else {
                // Style this differently
                return <div className="content">{q_a.question}</div>
              }
            }
          )}
        </div>
        
      </div>
      <div className="side"></div>
    </div>
  )
}

export default App;

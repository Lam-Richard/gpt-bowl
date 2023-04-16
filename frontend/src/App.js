import { useState, useEffect } from 'react';
import openSocket from 'socket.io-client';
import "./App.css";
import QuizBowlQuestion from './Components/QuizBowlQuestion'
import Heading from './Components/Heading'
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Timer from './Components/Timer';
import TimerQuestion from './Components/TimerQuestion';
import TextField from '@mui/material/TextField';


// import { BrowserRouter, Route, Routes } from 'react-router-dom';

// Import the functions you need from the SDKs you need

const QUESTION_DURATION = 20;

const colors = ["red", "blue", "green", "yellow", "orange", "purple", "pink", "black", "white", "gray"];
const nonColorAdjectives = ["fuzzy", "sparkling", "dazzling", "brave", "witty", "fierce", "cunning", "wild", "hilarious", "clever"];
const animals = ["panda", "giraffe", "koala", "squirrel", "lion", "tiger", "elephant", "rhino", "zebra", "kangaroo"];

function generateRandomString() {
  const colorIndex = Math.floor(Math.random() * colors.length);
  const nonColorAdjectiveIndex = Math.floor(Math.random() * nonColorAdjectives.length);
  const animalIndex = Math.floor(Math.random() * animals.length);
  const color = colors[colorIndex];
  const nonColorAdjective = nonColorAdjectives[nonColorAdjectiveIndex];
  const animal = animals[animalIndex];
  return `${color}-${nonColorAdjective}-${animal}`;
}


const socket = openSocket('http://localhost:3000', {rejectUnauthorized: false, transports: ['websocket']});
const id = generateRandomString();

function App() {

  const roomCode = 200;
  const [guess, setGuess] = useState('');
  const [users, setUsers] = useState([]);
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
    getUsers();

    socket.on('receiveUsers', (payload) => {
      setUsers(payload.users);
    })
  }, []);

  const getUsers = () => {
    socket.emit('getUsers', {roomCode: roomCode});
  }

  useEffect(() => {
    console.log("Users: ", users);
  }, [users])

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
  }, [canGuess, scroll]);

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

      setCurrentBuzzes([{message: `${payload.id}: ${payload.guess} (${payload.isCorrect})`}, ...currentBuzzes]);
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

  // Bug has nothing to do with this because it still goes when i turn it off
  useEffect(() => {
    socket.on("timer", (payload) => {
      setTimer(QUESTION_DURATION - payload.time);
      if (timer == 0) {
        setCanGuess(false);
      }
    })
  }, [])

  useEffect(() => {
    console.log("Timer useEffect: ", timer);
  }, [timer])

  useEffect(() => {
    socket.on('postNextQuestion', (q_a) => {
      setQuestions([q_a, ...questions]);
      setCurrentBuzzes([]);
      setTimer(20);
    })
  }, [questions, currentBuzzes, timer])

  useEffect(() => {
      socket.on('startScroll', (payload) => {
        setScroll(true);
        console.log("Can scroll now!");
    })
  }, [])

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
      {/* {scroll ? <Timer time={timer} IsPaused={!scroll} handleTimerChange={handleTimerChange}/> : <TimerQuestion time={7} isPaused={!scroll} setIsPaused={setScroll}/>} */}

        <div className="guessbar">
          <div>
            <div style={{display: "center"}}>
              <Button 
                style={{height: "40px", width: "100px", backgroundColor: '#2c3e50'}}
                onClick={() => {
                  console.log("Clicking...");
                  nextQuestion({roomCode: roomCode})
                }
                }
                variant="contained">
                New
              </Button>

              <Button 
                style={{height: "40px", width: "100px", backgroundColor: '#2c3e50'}}
                onClick={() => {
                  console.log("Clicking...");

                  if (questions.length > 0) {
                    sendBuzz({roomCode: roomCode, id: id})
                    handleTimerChange(timer);
                  }
                }
                }
                variant="contained">
                Buzz
              </Button>

              <Button 
                style={{height: "40px", width: "100px", backgroundColor: '#2c3e50'}}
                onClick={() => {
                  if (canGuess) {
                    setAnswered(true)
                    console.log("Send my Guess in! This should be a key listener though...");
                    socket.emit('makeGuess', {id: id, guess: guess})
                  } else {
                    console.log("Can't Guess")
                  }
                }
                }
                variant="contained">
                Guess
              </Button>
              </div>


              <TextField
                value={guess} 
                onEnter={() => setGuess('')} 
                onChange={(e) => {setGuess(e.target.value)}}
                label="Guess here..."
                variant="standard"
                >
              </TextField>
          </div>




        </div>



        {/* Log should be scrollable in the future */}
        <div className="log">
          {questions.map((q_a, index) =>
            {
              console.log("Index: ", index);
              if (index == 0) {

                return ( 
                  <div>
                    {scroll ? <Timer questions={questions} time={timer} isPaused={!scroll} handleTimerChange={handleTimerChange}/> : <TimerQuestion questions={questions} time={7} isPaused={!scroll} setIsPaused={setScroll}/>}
                    <QuizBowlQuestion key={q_a.answer} question={q_a.question} scroll={scroll} setScroll={setScroll}/>
                    {currentBuzzes.map(buzz => <Card className="guessBuzz"><CardContent>{buzz.message}</CardContent></Card>)}
                  </div>
                )
              } else {
                // Style this differently
                
                return <Card className="grayed-out gray-card" sx={{ padding: '10px' }}><CardContent>{q_a.question} <br/><br/> {q_a.answer}</CardContent></Card>
              }
            }
          )}
        </div>
        
      </div>



      <div className="side">
          {/* <div className="bold">Users in the Room: </div> */}
          <Card className="bold" sx={{ textAlign: 'center', bgcolor: 'darkgreen',  borderTopLeftRadius: 25, borderTopRightRadius: 25, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}>
            <CardContent sx={{ color: 'white' }}>
              Users in the Room:
            </CardContent>
          </Card>
          <Card sx={{ textAlign: 'center', borderTopLeftRadius: 0, borderTopRightRadius: 0, borderBottomLeftRadius: 25, borderBottomRightRadius: 25 }}>
            <CardContent>
              <ol>
                {users.map(user => <li>{user}</li>)}
              </ol>
            </CardContent>
          </Card>
          
      </div>
    </div>
  )
}

export default App;

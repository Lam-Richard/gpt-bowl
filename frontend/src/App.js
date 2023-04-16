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


// import { BrowserRouter, Route, Routes } from 'react-router-dom';

// Import the functions you need from the SDKs you need

const QUESTION_DURATION = 20;

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
      {/* {scroll ? <Timer time={timer} IsPaused={!scroll} handleTimerChange={handleTimerChange}/> : <TimerQuestion time={7} isPaused={!scroll} setIsPaused={setScroll}/>} */}

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
                handleTimerChange(timer);
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
                    {scroll ? <Timer questions={questions} time={timer} isPaused={!scroll} handleTimerChange={handleTimerChange}/> : <TimerQuestion questions={questions} time={7} isPaused={!scroll} setIsPaused={setScroll}/>}
                    <QuizBowlQuestion key={q_a.answer} question={q_a.question} scroll={scroll} setScroll={setScroll}/>
                    {currentBuzzes.map(buzz => <div>{buzz.message}</div>)}
                  </div>
                )
              } else {
                // Style this differently
                
                return <Card className="grayed-out gray-card" style={{ fontFamily: 'Nunito'}}><CardContent>{q_a.question} <br/><br/> {q_a.answer}</CardContent></Card>
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

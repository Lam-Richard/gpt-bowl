const socketIO = require('socket.io');
const express = require('express');
const app = express();
const cors = require('cors');
const http = require('http').createServer(app);
const io = socketIO(http, {
    cors: {
        origin: 'http://localhost:3001',
        methods: ['GET', 'POST']
    }
});
const gpt = require('./gpt.js');

const firestore = require('./firebase.js');


async function getQuestion() {
    let coin = Math.random();
    console.log("coin: ", coin);
    if (coin > 0.3) {
        let q_a = await gpt.generateQuestion("Science");
        await firestore.writeData(q_a.question, q_a.answer);
        return {
            question: q_a.question,
            answer: q_a.answer,
            message_type: "q_a"
        }
    } else {
        let data = await firestore.getData();
        data = Object.values(data);
        let q_a = data[Math.floor(data.length * Math.random())];
        return {
            question: q_a.question,
            answer: q_a.answer,
            message_type: "q_a"
        }
    }
}


// when the length of buzzing_queue changes, fire an event (allow guess or something). 


// "Next Question" event: tell the server to give the clients a question (scrolling) [Done]

// "Buzz" event: enqueue a "buzz," which should allow the user to submit a guess, and stop the scrolling

// "Stop Question" event: stop the question from scrolling

// "Start Timer" event: have the timer for guesses going

// "Reset Timer" event: in the case that the person is wrong

// "Guess Events"


// All socket.on events should receive a "payload object"

app.use(cors());

const PORT = 3000;

app.get('/', (req, res) => {

    res.send('Server is up and running');
    
  });


// as clients join, give them an identifier on the front and back and add it here
let users = {};
let completedQuestions = []
let already_timing = false;

// Create a proxy for the array
const buzzingQueue = new Proxy([], {
    // Trap for set
    set(target, prop, value) {
      // Add the item to the array
      Reflect.set(target, prop, value);
      // If the array is not empty, start the timer
      if (target.length > 0 && already_timing == false) {
        already_timing = true;
        console.log(`Emitting to room ${users[buzzingQueue.slice(-1)]}`)
        io.to(users[buzzingQueue.slice(-1)]).emit("confirmBuzz", {message_type: "confirm", id: buzzingQueue.slice(-1)});
        startTimer();
      }
      return true;
    },
    // Trap for deleteProperty
    deleteProperty(target, prop) {
      // Delete the property from the array
      Reflect.deleteProperty(target, prop);
      // If the array is not empty, start the timer
      if (target.length > 1) {
        already_timing = true;
        io.to(users[buzzingQueue.slice(-1)]).emit("confirmBuzz", {message_type: "confirm", id: buzzingQueue.slice(-1)});
        startTimer();
      } else {
        already_timing = false;
      }
      return true;
    },
  });
  
  // Define the timer function
  function startTimer() {
    let count = 1;
    console.log("Queue at timer start: ", buzzingQueue);
    const intervalId = setInterval(() => {
      console.log(`Count: ${count}`);
      count++;
      if (count > 10) {
        clearInterval(intervalId);
        // Pop the first item from the array when the timer completes
        console.log("Start scroll!!!")
        io.to(users[buzzingQueue.slice(-1)]).emit("startScroll", {message_type: "startScroll", id: buzzingQueue.slice(-1)})

        buzzingQueue.pop();
        console.log("Queue at timer end: ", buzzingQueue);
      }
    }, 1000);
  }
  

io.on('connection', (socket) => {

    console.log("A new client has connected to the server.")

    socket.on('joinRoom', (payload) => {
        socket.join(payload.roomCode);
        // For later use...!
        users[payload.id] = payload.roomCode;

        console.log("Users in the room: ", payload.id);
        console.log(`User ${payload.id} joined room ${payload.roomCode}`);
    });

    socket.on('getNextQuestion', async (payload) => {
        let q_a = await getQuestion();

        // Dummy question & answer to avoid calling GPT API
        // let q_a = {
        //     question: "Lorem ipsum dolor lorem ipsum dolor lorem ipsum dolor lorem ipsum dolor lorem ipsum dolor lorem ipsum dolor lorem ipsum dolor lorem ipsum dolor lorem ipsum dolor ",
        //     answer: "Lorem"
        // }

        completedQuestions.push(q_a)

        io.to(payload.roomCode).emit('postNextQuestion', q_a);
    })

    socket.on('sendBuzz', (payload) => {
        // This can be anything...?
        buzzingQueue.unshift(payload.id);
    })


    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });

    socket.on('makeGuess', (payload) => {
        const guess = payload.guess
        const correct = completedQuestions.slice(-1)[0].answer
        
        const isCorrect = gpt.similarStrings(correct, guess)
        if (isCorrect) {
            console.log("Answer is correct")
        }
        else {
            console.log("Answer is wrong")
        }

        socket.emit("result", {id: payload.id, isCorrect: isCorrect})
    })
    
});

http.listen(3000, () => {
  console.log(`Server listening on port ${PORT}`);
});


// Test for generating questions
// const questionAnswerPair = gpt.generateQuestion("Greek history")

// Test for similar strings
// console.log(gpt.similarStrings('he --..l-- .. lo     ', 'hello'))
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

const QUESTION_DURATION = 20;
let paused = false;

async function getQuestion() {
    let coin = Math.random();
    console.log("coin: ", coin);
    if (coin > 1) {
        let q_a = await gpt.generateQuestion("Science");
        await firestore.writeData(q_a.question, q_a.answer);
        return {
            question: q_a.question,
            answer: q_a.answer,
            message_type: "q_a",
            buzzes: []
        }
    } else {
        let data = await firestore.getData();
        data = Object.values(data);
        let q_a = data[Math.floor(data.length * Math.random())];
        return {
            question: q_a.question,
            answer: q_a.answer,
            message_type: "q_a",
            buzzes: []
        }
    }
}

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
let buzzingQueue = new Proxy([], {
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
    let count = 0;
    console.log("Queue at timer start: ", buzzingQueue);
    const intervalId = setInterval(() => {
      console.log(`Count: ${count}`);
      if (!paused) {
        count++;
        io.to(users[buzzingQueue.slice(-1)]).emit("timer", {time: count})
        if (count >= QUESTION_DURATION) {
          clearInterval(intervalId);
          // Pop the first item from the array when the timer completes
          console.log("Start scroll!!!")
          io.to(users[buzzingQueue.slice(-1)]).emit("timer", {time: 0})
          io.to(users[buzzingQueue.slice(-1)]).emit("startScroll", {message_type: "startScroll", id: buzzingQueue.slice(-1)})
  
          buzzingQueue.pop();
          console.log("Queue at timer end: ", buzzingQueue);
      }
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
        //     question: "The first step in this process can be further broken down into leptotene, zygotene, and pachytene phases. A common problem during this process is nondisjunction, which leads to conditions such as Klinefelter's Syndrome and Down Syndrome. This process involves two instances of prophase, metaphase, anaphase, and telophase. For 10 points, name this process used to create haploid cells, such as sperm and eggs.",
        //     answer: "Meiosis"
        // }

        completedQuestions.push(q_a)

        io.to(payload.roomCode).emit('postNextQuestion', q_a);
    })

    socket.on('sendBuzz', (payload) => {
        // This can be anything...?
        buzzingQueue.unshift(payload.id);
        paused = true
    })


    socket.on('getUsers', (payload) => {
        let all_users = Object.keys(users)
        console.log("All Users: ", all_users);
        io.to(payload.roomCode).emit('receiveUsers', {users: all_users.filter(user => users[user] == payload.roomCode)})
    })

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });

    socket.on('makeGuess', (payload) => {
        const guess = payload.guess
        const correct = completedQuestions.slice(-1)[0].answer
        paused = false
        
        const isCorrect = gpt.similarStrings(correct, guess)
        if (isCorrect) {
            console.log("Answer is correct")
        }
        else {
            console.log("Answer is wrong")
        }

        socket.emit("confirmGuess", {id: payload.id, guess: guess, isCorrect: isCorrect})
    })
    
});

http.listen(3000, () => {
  console.log(`Server listening on port ${PORT}`);
});


// Test for generating questions
// const questionAnswerPair = gpt.generateQuestion("Greek history")

// Test for similar strings
// console.log(gpt.similarStrings('he --..l-- .. lo     ', 'hello'))
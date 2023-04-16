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


class Timer {
  constructor(emitEvent, startDuration, roomCode, runWhenFinish) {
      this.emitEvent = emitEvent
      this.startDuration = startDuration
      this.time = startDuration
      this.roomCode = roomCode
      this.runWhenFinish = runWhenFinish
      this.interval = setInterval(() => {
      console.log(this.emitEvent + ": ", this.time)
      if (!this.paused) {
        if (this.time > 0) {
          this.time--;
          io.to(this.roomCode).emit(this.emitEvent, {time: this.time})
        }
        else {
          this.paused = true;
          this.runWhenFinish()
        }
      }
    }, 1000)
    this.paused = true;
  }

  startTimer() {
    this.paused = false;
  }

  pauseTimer() {
    this.paused = true;
  }

  resumeTimer() {
    this.paused = false;
  }

  resetTimer() {
    this.time = this.startDuration
  }

  endTimer() {
    clearInterval(this.interval)
  }

  isRunning() {
    return !this.paused;
  }
}

const roomCode = 200;
const questionTimer = new Timer('questionTimer', 20, roomCode, () =>
{
  // Pop the first item from the array when the timer completes
  console.log("Start scroll!!!")
  io.to(roomCode).emit("startScroll", {message_type: "startScroll", id: buzzingQueue.slice(-1)})

  buzzingQueue.pop();
  console.log("Queue at timer end: ", buzzingQueue);
})
const buzzTimer = new Timer('buzzTimer', 7, roomCode, () => {
  questionTimer.resumeTimer()
  buzzTimer.resetTimer()
  buzzTimer.pauseTimer()
  io.to(roomCode).emit('buzzOver')
})


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
        console.log(`Emitting to room ${roomCode}`)
        io.to(roomCode).emit("confirmBuzz", {message_type: "confirm", id: buzzingQueue.slice(-1)});
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
        io.to(roomCode).emit("confirmBuzz", {message_type: "confirm", id: buzzingQueue.slice(-1)});
      } else {
        already_timing = false;
      }
      return true;
    },
  });
  

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
      console.log('Socket: getNextQuestion received')

        let q_a = await getQuestion();

        // Dummy question & answer to avoid calling GPT API
        // let q_a = {
        //     question: "The first step in this process can be further broken down into leptotene, zygotene, and pachytene phases. A common problem during this process is nondisjunction, which leads to conditions such as Klinefelter's Syndrome and Down Syndrome. This process involves two instances of prophase, metaphase, anaphase, and telophase. For 10 points, name this process used to create haploid cells, such as sperm and eggs.",
        //     answer: "Meiosis"
        // }

        
        completedQuestions.push(q_a)
        io.to(roomCode).emit("startScroll", {message_type: "startScroll", id: roomCode})

        io.to(payload.roomCode).emit('postNextQuestion', q_a);
        questionTimer.resetTimer()
        questionTimer.startTimer()
      console.log('Socket: end of getNextQuestion')

    })

    socket.on('sendBuzz', (payload) => {
        // This can be anything...?
        buzzingQueue.unshift(payload.id);
        questionTimer.pauseTimer()
        buzzTimer.resetTimer()
        buzzTimer.startTimer()
    })


    socket.on('endQuestion', () => {
      questionTimer.resetTimer()
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
        console.log('Socket: makeGuess received')
        const guess = payload.guess
        const correct = completedQuestions.slice(-1)[0].answer
        questionTimer.resumeTimer()
        buzzTimer.pauseTimer()
        buzzTimer.resetTimer()
        
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


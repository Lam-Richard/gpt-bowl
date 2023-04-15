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

/*

    Message formats:

    Buzz: {Person: , Room Code: }
        - Stops reading, starts timer, if timer runs out before GUESS is emitted by the same user, keep reading
    Guess: {Person: , Message: }
        - Matches the guess using algorithm, if not correct, update points, keep reading
    
    Correct?: {Bool}


    Ask: {}
        If a question was answered correctly, we need to emit another question
    

*/

app.use(cors());

const PORT = 3000;

app.get('/', (req, res) => {
    res.send('Server is up and running');
  });
  
io.on('connection', (socket) => {
console.log('New client connected');

    socket.on('joinRoom', (roomCode) => {
        socket.join(roomCode);
        console.log(`User joined room ${roomCode}`);
    });

    socket.on('buzz', (payload, roomCode) => {

    })

    


    socket.on('message', (payload, roomCode) => {
        io.to(roomCode).emit('message', payload);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

http.listen(3000, () => {
console.log(`Server listening on port ${PORT}`);
});
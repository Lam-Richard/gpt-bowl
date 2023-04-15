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

socket.on('message', (message, roomCode) => {
    io.to(roomCode).emit('message', message);
});

socket.on('disconnect', () => {
    console.log('Client disconnected');
});
});

http.listen(3000, () => {
console.log(`Server listening on port ${PORT}`);
});
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const fs = require('fs');

// Request Logger (Move to TOP)
app.use((req, res, next) => {
  const log = `>>> INCOMING [${new Date().toLocaleTimeString()}]: ${req.method} ${req.url}\n`;
  console.log(log.trim());
  fs.appendFileSync('server.log', log);
  next();
});

// Middleware
app.use(cors());
app.use(express.json());

const path = require('path');
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}
app.use('/uploads', express.static(uploadsDir));

// JSON Error Handler
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('!!! JSON Syntax Error at:', req.url);
    return res.status(400).json({ message: 'Invalid JSON format' });
  }
  next();
});

// Routes
console.log('Registering Auth routes...');
app.use('/api/auth', require('./routes/auth'));
console.log('Registering Experts routes...');
app.use('/api/experts', require('./routes/experts'));
console.log('Registering Assessments routes...');
app.use('/api/assessments', require('./routes/assessments'));
console.log('Registering Community routes...');
app.use('/api/community', require('./routes/community'));
console.log('Registering Consultations routes...');
app.use('/api/consultations', require('./routes/consultations'));
app.use('/api/users', require('./routes/users'));
app.use('/api/partners', require('./routes/partners'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/reviews', require('./routes/reviews'));

// Basic Route
app.get('/', (req, res) => {
  res.send('Her-2-Her Backend API is running...');
});

const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Socket.io for WebRTC signaling
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room: ${roomId}`);
    socket.to(roomId).emit('user-connected', socket.id);
  });

  socket.on('signal', (data) => {
    console.log(`Forwarding signal from ${socket.id} to room: ${data.roomId}`);
    socket.to(data.roomId).emit('signal', {
      signal: data.signal,
      from: socket.id
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Start server immediately (non-blocking startup)
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Connect to MongoDB asynchronously with retry options
mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
})
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    console.error('Note: API calls requiring the database will fail until connection is restored.');
  });


// server.js
const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Serve frontend
app.use('/', express.static(path.join(__dirname, 'public')));

const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, {
  // When deploying, restrict origin to your frontend domain
  cors: { origin: '*' }
});

/*
Invite-only chat
- Invitation codes in INVITATION_CODES
- Max participants per code: MAX_PARTICIPANTS
- Messages per room stored in-memory and deleted after ROOM_LIFETIME_MS
*/

const INVITATION_CODES = new Set(['15001']); // add more codes here if needed
const MAX_PARTICIPANTS = parseInt(process.env.MAX_PARTICIPANTS || '5', 10);
const ROOM_LIFETIME_MS = parseInt(process.env.ROOM_LIFETIME_MS || String(24 * 60 * 60 * 1000), 10);

const ROOMS = {}; // { code: { code, createdAt, expiresAt, messages: [], sockets: Set(), timeoutHandle } }

function createOrGetRoom(code) {
  const now = Date.now();
  if (ROOMS[code]) return ROOMS[code];
  const room = {
    code,
    createdAt: now,
    expiresAt: now + ROOM_LIFETIME_MS,
    messages: [],
    sockets: new Set(),
    timeoutHandle: null
  };
  room.timeoutHandle = setTimeout(() => {
    deleteRoom(code);
  }, ROOM_LIFETIME_MS);
  ROOMS[code] = room;
  console.log(`Created room ${code}, expires in ${ROOM_LIFETIME_MS} ms`);
  return room;
}

function deleteRoom(code) {
  const room = ROOMS[code];
  if (!room) return;
  if (room.timeoutHandle) clearTimeout(room.timeoutHandle);
  // notify connected clients
  room.sockets.forEach(sid => {
    const sock = io.sockets.sockets.get(sid);
    if (sock) sock.emit('room-closed', { reason: 'expired' });
  });
  delete ROOMS[code];
  console.log(`Deleted room ${code}`);
}

// API: validate join code (creates room if valid)
app.post('/api/join', (req, res) => {
  const { code } = req.body || {};
  if (!code) return res.status(400).json({ error: 'missing_code' });
  if (!INVITATION_CODES.has(code)) return res.status(403).json({ error: 'invalid_code' });
  const room = createOrGetRoom(code);
  res.json({ code: room.code, expiresAt: room.expiresAt, participantCount: room.sockets.size, messagesCount: room.messages.length });
});

// API: get room meta
app.get('/api/rooms/:code', (req, res) => {
  const code = req.params.code;
  const room = ROOMS[code];
  if (!room) return res.status(404).json({ error: 'not_found' });
  res.json({ code: room.code, createdAt: room.createdAt, expiresAt: room.expiresAt, participantCount: room.sockets.size, messagesCount: room.messages.length });
});

// optional: list codes (not secured) - remove for production
app.get('/api/codes', (req, res) => {
  res.json({ codes: Array.from(INVITATION_CODES) });
});

// Socket.IO
io.on('connection', (socket) => {
  console.log('socket connected', socket.id);

  socket.on('join', (payload) => {
    const { code, name } = payload || {};
    if (!code || !name) return socket.emit('join-error', { error: 'missing_code_or_name' });
    if (!INVITATION_CODES.has(code)) return socket.emit('join-error', { error: 'invalid_code' });

    const room = createOrGetRoom(code);

    if (room.sockets.size >= MAX_PARTICIPANTS) {
      return socket.emit('join-error', { error: 'room_full' });
    }

    socket.join(code);
    room.sockets.add(socket.id);
    socket.data.code = code;
    socket.data.name = name;

    // send history
    socket.emit('history', room.messages);

    // notify others
    socket.to(code).emit('peer-joined', { name });

    // emit room meta
    io.to(code).emit('room-meta', { participantCount: room.sockets.size, expiresAt: room.expiresAt });

    console.log(`${name} joined room ${code}`);
  });

  socket.on('message', (payload) => {
    const code = socket.data.code;
    const name = socket.data.name || 'Unbekannt';
    if (!code) return socket.emit('error', { error: 'not_in_room' });
    const room = ROOMS[code];
    if (!room) return socket.emit('error', { error: 'room_not_found' });

    const msg = { name, text: String(payload.text || ''), ts: Date.now() };
    room.messages.push(msg);

    // broadcast to room
    io.to(code).emit('message', msg);
  });

  socket.on('disconnect', () => {
    const code = socket.data.code;
    if (code) {
      const room = ROOMS[code];
      if (room) {
        room.sockets.delete(socket.id);
        io.to(code).emit('room-meta', { participantCount: room.sockets.size, expiresAt: room.expiresAt });
      }
    }
    console.log('socket disconnected', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

const rooms = new Map();
const players = new Map();

function debugState() {
  console.log('\n--- Mevcut Durum ---');
  console.log('Odalar:');
  rooms.forEach((room, roomId) => {
    console.log(`Oda ${roomId}:`, {
      players: room.players.map(id => ({
        id,
        nickname: players.get(id)?.nickname
      })),
      moves: room.moves,
      scores: room.scores
    });
  });
  console.log('\nOyuncular:');
  players.forEach((player, id) => {
    console.log(`${id}:`, player);
  });
  console.log('-------------------\n');
}

// Oda kontrolü
function validateRoom(roomId, socket) {
  const room = rooms.get(roomId);
  if (!room) {
    socket.emit('game_error', 'Oda bulunamadı');
    console.log(`Oda bulunamadı: ${roomId}`);
    return null;
  }
  return room;
}

io.on('connection', (socket) => {
  console.log('Yeni kullanıcı bağlandı:', socket.id);
  
  const nickname = `Oyuncu${Math.floor(Math.random() * 1000)}`;
  players.set(socket.id, { nickname });
  socket.emit('nickname_assigned', nickname);

  socket.on('create_room', () => {
    let existingRoom = null;
    rooms.forEach((room, roomId) => {
      if (room.players.includes(socket.id)) {
        existingRoom = roomId;
      }
    });

    if (existingRoom) {
      socket.emit('game_error', 'Zaten bir odadasınız');
      return;
    }

    const roomId = uuidv4();
    rooms.set(roomId, {
      players: [socket.id],
      moves: {},
      scores: {},
      gameCount: 0
    });
    socket.join(roomId);
    socket.emit('room_created', roomId);
    console.log(`Oda oluşturuldu: ${roomId}`);
    debugState();
  });

  socket.on('join_room', (roomId) => {
    console.log(`Odaya katılma isteği - Oyuncu: ${socket.id}, Oda: ${roomId}`);
    
    const room = validateRoom(roomId, socket);
    if (!room) return;

    if (room.players.includes(socket.id)) {
      socket.emit('game_error', 'Zaten bu odasınız');
      return;
    }

    if (room.players.length >= 2) {
      socket.emit('game_error', 'Oda dolu');
      return;
    }

    room.players.push(socket.id);
    socket.join(roomId);
    room.scores[socket.id] = 0;
    
    const firstPlayer = room.players[0];
    room.scores[firstPlayer] = room.scores[firstPlayer] || 0;

    io.to(roomId).emit('game_start', {
      players: room.players.map(id => ({
        id,
        nickname: players.get(id).nickname
      }))
    });
    
    console.log(`Oyuncu ${socket.id} odaya katıldı: ${roomId}`);
    debugState();
  });

  socket.on('make_move', ({ roomId, move }) => {
    console.log(`Hamle alındı - Oyuncu: ${socket.id}, Hamle: ${move}, Oda: ${roomId}`);
    
    const room = validateRoom(roomId, socket);
    if (!room) return;

    if (!room.players.includes(socket.id)) {
      socket.emit('game_error', 'Bu odada oyuncu değilsiniz');
      return;
    }

    if (room.moves[socket.id]) {
      socket.emit('game_error', 'Zaten bir hamle yaptınız');
      return;
    }

    room.moves[socket.id] = move;
    console.log(`Hamle kaydedildi - Oda: ${roomId}`, room.moves);
    
    socket.to(roomId).emit('opponent_moved');

    if (Object.keys(room.moves).length === 2) {
      const [player1, player2] = room.players;
      const move1 = room.moves[player1];
      const move2 = room.moves[player2];
      
      console.log(`Tüm hamleler yapıldı - Oda: ${roomId}`, {
        [player1]: move1,
        [player2]: move2
      });

      let result = determineWinner(move1, move2);
      
      if (result === 1) {
        room.scores[player1] = (room.scores[player1] || 0) + 1;
      } else if (result === 2) {
        room.scores[player2] = (room.scores[player2] || 0) + 1;
      }

      io.to(roomId).emit('game_result', {
        moves: room.moves,
        scores: room.scores,
        winner: result === 0 ? 'berabere' : 
                result === 1 ? players.get(player1).nickname : 
                players.get(player2).nickname
      });

      room.moves = {};
      room.gameCount++;
      
      console.log(`Oyun sonucu - Oda: ${roomId}, Kazanan: ${result}`);
      debugState();
    }
  });

  socket.on('disconnect', () => {
    console.log('Oyuncu ayrıldı:', socket.id);
    const playerInfo = players.get(socket.id);
    players.delete(socket.id);
    
    rooms.forEach((room, roomId) => {
      if (room.players.includes(socket.id)) {
        io.to(roomId).emit('player_disconnected', {
          message: `${playerInfo?.nickname || 'Rakip'} oyundan ayrıldı`,
          disconnectedPlayer: socket.id
        });
        rooms.delete(roomId);
        console.log(`Oda silindi: ${roomId}`);
      }
    });
    debugState();
  });
});

function determineWinner(move1, move2) {
  if (move1 === move2) return 0;
  if (
    (move1 === 'taş' && move2 === 'makas') ||
    (move1 === 'kağıt' && move2 === 'taş') ||
    (move1 === 'makas' && move2 === 'kağıt')
  ) {
    return 1;
  }
  return 2;
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor`);
}); 
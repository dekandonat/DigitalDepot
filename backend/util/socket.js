const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const verifyAsync = promisify(jwt.verify);
const db = require('./database');
let io;

module.exports = {
  init: (server) => {
    io = new Server(server, {
      cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    //JWT ellenőrzés
    io.use(async (socket, next) => {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Nincs token'));

      try {
        const decodedToken = await verifyAsync(token, process.env.SECRET);
        socket.user = decodedToken;

        if (socket.user.role === 'admin') {
          socket.join('room_admin');
          console.log(`Admin ${socket.user.id} belépett az adminszobába`);
        } else {
          socket.join(`room_${socket.user.id}`);
          console.log(
            `User ${socket.user.id} belépett a saját szobájába: room_${socket.user.id}`
          );
        }

        next();
      } catch (err) {
        return next(new Error('Lejárt a token!'));
      }
    });

    //ide kerülnek az események
    io.on('connection', (socket) => {
      console.log('Új kliens csatlakozott:', socket.id);

      socket.on('send_message', async (data) => {
        /*
        console.log('Új üzenet: ' + message);
        io.emit('receiveMessage', {
          text: message,
          sender: socket.id,
          date: Date.now(),
        });
        */
        const { id, role } = socket.user;

        const isObject = typeof data === 'object';
        const messageText = isObject ? data.text : data;

        if (role == 'user') {
          const message = {
            text: messageText,
            sender: id,
            date: Date.now(),
          };
          io.to('room_admin').emit('receive_message', message);
          socket.emit('receive_message', message);
          console.log('Üzenet elküldve: ' + message);
          try {
            await db.execute(
              'INSERT INTO messages(sender, message, sentAt, recipientId) VALUES (?, ?, NOW(), NULL);',
              [message.sender, message.text]
            );
          } catch (err) {
            console.log('Nem sikerült menteni egy üzenetet');
          }
        } else {
          if (data.recipientId) {
            const message = {
              text: messageText,
              sender: id,
              date: Date.now(),
              recipientId: data.recipientId,
            };
            io.to(`room_${data.recipientId}`).emit('receive_message', message);
            socket.emit('receive_message', message);
            console.log('Üzenet elküldve: ' + message);
            try {
              await db.execute(
                'INSERT INTO messages(sender, message, sentAt, recipientId) VALUES (?, ?, NOW(), ?);',
                [message.sender, message.text, message.recipientId]
              );
            } catch (err) {
              console.log('Nem sikerült menteni egy üzenetet');
            }
          } else {
            console.log('Nem volt megadva a fogadó');
          }
        }
      });
    });

    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error('Socket.io nincs inicializálva');
    }
    return io;
  },
};

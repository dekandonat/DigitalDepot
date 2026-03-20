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

    io.use(async (socket, next) => {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Nincs token'));

      try {
        const decodedToken = await verifyAsync(token, process.env.SECRET);
        socket.user = decodedToken;

        if (socket.user.role === 'admin' || socket.user.role === 'owner') {
          socket.join('room_admin');
        } else {
          socket.join(`room_${socket.user.id}`);
        }

        next();
      } catch (err) {
        return next(new Error('Lejárt a token!'));
      }
    });

    // ide kerülnek az események
    io.on('connection', (socket) => {
      socket.on('send_message', async (data) => {
        const { id, role } = socket.user;
        
        let messageText = '';
        if (typeof data === 'string') {
          messageText = data;
        } else if (data && typeof data === 'object') {
          messageText = data.text || data.messageText || data.message || '';
        }

        if (role === 'user') {
          const message = {
            text: messageText,
            sender: id,
            date: Date.now(),
          };
          io.to('room_admin').emit('receive_message', message);
          socket.emit('receive_message', message);
          try {
            await db.execute(
              'INSERT INTO messages(sender, message, sentAt, recipientId) VALUES (?, ?, NOW(), NULL);',
              [message.sender, message.text]
            );
          } catch (err) {
            console.log('Hiba a user üzenet mentésekor: ' + err.message);
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
            try {
              await db.execute(
                'INSERT INTO messages(sender, message, sentAt, recipientId) VALUES (?, ?, NOW(), ?);',
                [message.sender, message.text, message.recipientId]
              );
            } catch (err) {
              console.log('Hiba az admin üzenet mentésekor: ' + err.message);
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
      throw new Error('Socket.io nincs inicializálva!');
    }
    return io;
  },
};
const { Server } = require('socket.io');

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

    //ide kerülnek az események
    io.on('connection', (socket) => {
      console.log('Új kliens csatlakozott:', socket.id);

      socket.on('send_message', (message) => {
        console.log('Új üzenet: ' + message);
        io.emit('receiveMessage', {
          text: message,
          sender: socket.id,
          date: Date.now(),
        });
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

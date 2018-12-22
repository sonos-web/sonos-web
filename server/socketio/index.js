const socketio = require('socket.io');

module.exports.listen = function listen(app) {
  const io = socketio.listen(app);
  return io;
};

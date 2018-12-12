var socketio = require('socket.io')

module.exports.listen = function (app) {
  const io = socketio.listen(app);
  return io
}
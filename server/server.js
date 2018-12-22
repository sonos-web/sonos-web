require('dotenv').config();
const app = require('./express')();
// eslint-disable-next-line import/order
const http = require('http').Server(app);
const socketio = require('./socketio');
const Routes = require('./routes');
const SonosNetwork = require('./sonos');


const io = socketio.listen(http);
const sonosNetwork = new SonosNetwork(io);
const routes = new Routes(sonosNetwork);

// Connect all our routes to our app
app.use('/api', routes.router);

const PORT = process.env.PORT || 5051;
http.listen(PORT, () => {
  console.info(`Server listening on port ${PORT}`);
});


function exitGracefully() {
  sonosNetwork.listener.stopListener().then(() => {
    sonosNetwork.socketio.disconnect();
    process.exit(0);
  }).catch(() => {
    process.exit(0);
  });
}

process.on('SIGINT', () => {
  console.log('sigint');
  exitGracefully();
});

process.on('SIGTERM', () => {
  console.log('sigterm');
  exitGracefully();
});

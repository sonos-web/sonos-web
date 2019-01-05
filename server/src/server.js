require('dotenv').config();
const app = require('./express')();
// eslint-disable-next-line import/order
const http = require('http').Server(app);
const socketio = require('./socketio');
const Routes = require('./routes');
const SonosNetwork = require('./sonos/SonosNetwork');


const io = socketio.listen(http);
const sonosNetwork = new SonosNetwork(io);
const routes = new Routes(sonosNetwork);

// Connect all our routes to our app
app.use('/', routes.router);

const PORT = process.env.PORT || 5051;
http.listen(PORT, () => {
  console.info(`Server listening on port ${PORT}`);
});


function exitGracefully() {
  sonosNetwork.listener.stopListener().then(() => {
    io.close();
    process.exit(0);
  }).catch(() => {
    process.exit(1);
  });
}

process.on('SIGINT', () => {
  exitGracefully();
});

process.on('SIGTERM', () => {
  exitGracefully();
});

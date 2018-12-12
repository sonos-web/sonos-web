const app = require('./express')()
const http = require('http').Server(app)
const socketio = require('./socketio')
const Routes = require('./routes')
const SonosNetwork = require('./sonos')


const io = socketio.listen(http);
const sonosNetwork = new SonosNetwork(io)
const routes = new Routes(sonosNetwork)

//Connect all our routes to our app
app.use('/api', routes.router)

const PORT = process.env.PORT || 5051
http.listen(PORT, function() {
  console.info(`Server listening on port ${PORT}`)
})

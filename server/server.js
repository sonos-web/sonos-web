const app = require('./express')()
const http = require('http').Server(app)
const routes = require('./routes')
const sonosEvents = require('./sonos/events')

//Connect all our routes to our app
app.use('/api', routes)

// Initialize Sonos listeners and socketio
sonosEvents(http)

const PORT = process.env.PORT || 5051
http.listen(PORT, function() {
  console.info(`Server listening on port ${PORT}`)
})

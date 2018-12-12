const app = require('./express')()
const http = require('http').Server(app)
const routes = require('./routes')
const sonosEvents = require('./sonos/events')
const io = require('./sonos/sockets').listen(http)

// Initialize Sonos listeners
sonosEvents()

//Connect all our routes to our app
app.use('/api', routes)

const PORT = process.env.PORT || 5051
http.listen(PORT, function() {
  console.info(`Server listening on port ${PORT}`)
})

const app = require('./express')()
const routes = require('./routes')
const sonosEvents = require('./sonos/events')

// Initialize Sonos listeners
sonosEvents()

//Connect all our routes to our app
app.use('/api', routes)

const PORT = process.env.PORT || 5051
app.listen(PORT, function() {
    console.info(`Server listening on port ${PORT}`)
})

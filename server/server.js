const app = require('./express')()
const routes = require('./routes')

//Connect all our routes to our app
app.use('/api', routes)

const PORT = process.env.PORT
app.listen(PORT, function() {
    console.info(`Server listening on port ${PORT}`)
})

// Dependencies
const serveStatic = require('serve-static')
const routes = require('express').Router()
const history = require('connect-history-api-fallback')

// the directory of the client code in the docker container in production
let clientDir = `${process.env.PWD}/dist`
let clientIndex = `${clientDir}/index.html`
if (process.env.NODE_ENV == 'production') {
    // In Production, all the client code will be in the 'dist' folder 
    routes.use(serveStatic(clientDir))
    // Redirect any GET requests to our client's router
    routes.use(history({index: clientIndex}))
}

// All Routes
routes.use('/zones', require('./zones'))
// End All Routes

// This MUST come last - all routes that we do not have endpoints for
if (process.env.NODE_ENV == 'production') {
    // send back to the client index
    routes.get('*', function(req, res) {
        res.sendFile(`${clientDir}/index.html`)
    })
} else {
    // send 404 error message
    routes.get('*', function(req, res) {
        res.status(404).send({'status': '404' ,'message': 'endpoint not found'})
    })
}

module.exports = routes

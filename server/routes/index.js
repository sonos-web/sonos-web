
// Dependencies
const serveStatic = require('serve-static')    
const history = require('connect-history-api-fallback')
const Zones = require('./zones')

module.exports = function Routes (sonosNetwork) {
    this.router = require('express').Router()
    this.sonosNetwork = sonosNetwork

    // the directory of the client code in the docker container in production
    let clientDir = `${process.env.PWD}/dist`
    let clientIndex = `${clientDir}/index.html`
    if (process.env.NODE_ENV == 'production') {
        // In Production, all the client code will be in the 'dist' folder 
        this.router.use(serveStatic(clientDir))
        // Redirect any GET requests to our client's router
        this.router.use(history({index: clientIndex}))
    }

    // All router
    const zones = new Zones(this.sonosNetwork)
    this.router.use('/zones', zones.router)
    // End All router

    // This MUST come last - all router that we do not have endpoints for
    if (process.env.NODE_ENV == 'production') {
        // send back to the client index
        this.router.get('*', function(req, res) {
            res.sendFile(`${clientDir}/index.html`)
        })
    } else {
        // send 404 error message
        this.router.get('*', function(req, res) {
            res.status(404).send({'status': '404' ,'message': 'endpoint not found'})
        })
    }
}

const rooms = require('express').Router()
const sonos = require('node-sonos')

// Retrieve all
rooms.get('/', function (req, res) {
    res.status(200).send('success!')
})


module.exports = test

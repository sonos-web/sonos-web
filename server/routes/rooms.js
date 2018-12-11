const rooms = require('express').Router()
const {Sonos, DeviceDiscovery} = require('sonos')

// Retrieve all
rooms.get('/', function (req, res) {
    DeviceDiscovery((device) => {
        console.log('found device at ' + device.host)
    })
        
    let kitchen = new Sonos('192.168.0.14')
    kitchen.getZoneInfo(console.log)    
    //res.status(200).send('success!')
})

module.exports = rooms

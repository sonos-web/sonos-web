const zones = require('express').Router()
const {DeviceDiscovery} = require('sonos')
// const {parseZoneGroups} = require('../sonos/helpers')

// // Retrieve all
// zones.get('/', function (req, res) {
//     DeviceDiscovery().once('DeviceAvailable', async function (device) {              
//         let groups = await device.getAllGroups()        
//         res.status(200).send(parseZoneGroups(groups))
//     })
// })

module.exports = zones

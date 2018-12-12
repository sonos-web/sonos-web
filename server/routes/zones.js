const router = require('express').Router();

module.exports = function Zones(sonosNetwork) {
  this.router = router;
  this.sonosNetwork = sonosNetwork;

  // Retrieve all
  this.router.get('/', (req, res) => {
    console.log(this.sonosNetwork.devices);
    res.status(200).send('hi');
    // DeviceDiscovery().once('DeviceAvailable', async function (device) {
    //     let groups = await device.getAllGroups()
    //     res.status(200).send(parseZoneGroups(groups))
    // })
  });
};

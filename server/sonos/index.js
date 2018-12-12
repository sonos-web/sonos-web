const { DeviceDiscovery, Listener } = require('sonos');

const SonosNetwork = function SonosNetwork(socketio) {
  this.socketio = socketio;
  this.devices = [];
  // Discover the Sonos network on initialization
  this.discover().then(() => {
    // Now that we have the devices, listen for events on them
    this.listen();
  });
};

/**
 * Get Sonos Devices on the network
 * @param {Number} timeout
 * @returns {Array}
 */
SonosNetwork.prototype.discover = async function discover(timeout = 5000) {
  return new Promise((resolve) => {
    this.socketio.on('connection', (socket) => {
      console.log('connected client');
      socket.emit('Discovering Sonos Devices');
    });

    const sonosSearch = DeviceDiscovery({ timeout });

    sonosSearch.on('DeviceAvailable', async (sonosDevice) => {
      const device = sonosDevice;
      device.deviceDescription().then((description) => {
        device.name = description.roomName;
        device.displayName = description.displayName;
        const UUID = description.UDN.split('uuid:')[1];
        device.id = UUID;
        console.log(device);
        Listener.subscribeTo(device).then(() => {
          this.devices.push(device);
        }).catch((error) => {
          switch (error.statusCode) {
            case 500:
              // We get this error when attempting to subscribe
              // to satellite speakers that are invisible
              // Don't know of an easy way at this point to filter them out
              // We don't want to or need to subscribe to them
              break;
            default:
              console.log(error);
          }
        });
      });
    });

    sonosSearch.on('timeout', () => {
      this.socketio.emit('Sonos Device Discovery Complete', this.devices);
      resolve(this.devices);
    });
  });
};

/**
 * Listen to all Sonos devices on the network
 */
SonosNetwork.prototype.listen = function listen() {
  this.devices.forEach((device) => {
    device.on('AVTransport', async (data) => {
      console.log(data);
      // let transportInfo = await parseAVTransportInfo(device, data)
      // io.emit('AVTransport State Changed', transportInfo)
    });
    device.on('RenderingControl', async (data) => {
      console.log(data);
    });
  });
};

// async function parseAVTransportInfo(device, data) {
//   try {
//     let deviceInfo = await device.deviceDescription()
//     let deviceID = deviceInfo.UDN.split('uuid:')[1]

//     return {
//       zoneID: deviceID,
//       zoneName: deviceInfo.roomName,
//       currentTrack: data.CurrentTrackMetaDataParsed,
//       nextTrack: data['r:NextTrackMetaDataParsed'],
//       currentTransportActions: data.CurrentTransportActions,
//       state: data.TransportState,
//       currentPlayMode: data.CurrentPlayMode
//     }    
//   } catch (error) {
//     console.log(error)
//   }    
// }


// /// Return a subset of the zone group information that is relevant
// const parseZoneGroups = function (groups) {
//   var zoneGroups = []    

//   for(group of groups) {        
//       zoneGroups.push({
//           id: group.ID,
//           coordinator_name: null,
//           coordinator: group.Coordinator,            
//           members: []
//       })
//       // iterate over all the members in this group...
//       for(zone of group.ZoneGroupMember) {
//           // find the zone group for this zone             
//           let zoneGroup = zoneGroups.filter(function(zoneGroup) {
//               return zoneGroup.coordinator === group.Coordinator
//           })[0]
//           let room = {
//               id: zone.UUID,                
//               name: zone.ZoneName,
//               isCoordinator: zone.UUID === group.Coordinator,
//           }
//           zoneGroup.members.push(room)
//       }
//   }

//   for(zoneGroup of zoneGroups) {
//       // assign the coordinator name to the group for referencing
//       let coordinator = zoneGroup.members.filter(function(member) {
//           return member.isCoordinator
//       })[0]
//       zoneGroup.coordinator_name = coordinator.name

//       // sort members alphabetically
//       zoneGroup.members.sort(function(member1, member2) {
//           return member1.name > member2.name
//       })     
//   }

//   zoneGroups.sort(function(group1, group2) {
//       return group1.coordinator_name > group2.coordinator_name
//   })           

//   return {zoneGroups}
// }

// /// Returns an instance of Sonos given its UUID
// /// There has to be a better way of doing this
// const getDeviceById = async function (deviceId) {
//   return new Promise(function (resolve) {
//       DeviceDiscovery(async function (device) {
//           let deviceInfo = await device.deviceDescription()
//           let deviceID = deviceInfo.UDN.split('uuid:')[1]
//           if (deviceID === deviceId) {
//              return resolve(device)
//           }
//       })
//   })  
 
// }

module.exports = SonosNetwork;

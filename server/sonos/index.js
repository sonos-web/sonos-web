const { DeviceDiscovery, Listener } = require('sonos');

const SonosNetwork = function SonosNetwork(socketio) {
  this.socketio = socketio;
  this.devices = [];
  this.zoneGroups = [];
  // Discover the Sonos network on initialization
  this.discover().then(() => {
    // Now that we have the devices, listen for events on them
    this._listen();
    // Build the zone groups
    this._parseZoneGroups();
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
SonosNetwork.prototype._listen = function listen() {
  this.devices.forEach((device) => {
    device.on('AVTransport', (data) => {
      const transportInfo = this._parseAVTransportInfo(data);
      console.log(transportInfo);
      // io.emit('AVTransport State Changed', transportInfo)
    });
    device.on('RenderingControl', (data) => {
      console.log(data);
    });
  });
};

SonosNetwork.prototype._parseAVTransportInfo = function parseAVTransportInfo(data) {
  return {
    currentTrack: data.CurrentTrackMetaDataParsed,
    nextTrack: data['r:NextTrackMetaDataParsed'],
    currentTransportActions: data.CurrentTransportActions,
    state: data.TransportState,
    currentPlayMode: data.CurrentPlayMode,
  };
};

// getAllGroups
// [ { Coordinator: 'RINCON_5CAAFD0E804401400',
//     ID: 'RINCON_5CAAFD0E804401400:100',
//     ZoneGroupMember: [ [Object] ] },
//   { Coordinator: 'RINCON_5CAAFD08506001400',
//     ID: 'RINCON_5CAAFD08506001400:71',
//     ZoneGroupMember: [ [Object] ] },
//   { Coordinator: 'RINCON_5CAAFDA4679401400',
//     ID: 'RINCON_5CAAFDA4679401400:118',
//     ZoneGroupMember: [ [Object] ] } ]

// ZoneGroupMember
// [ { UUID: 'RINCON_5CAAFD08506001400',
//     Location: 'http://192.168.0.14:1400/xml/device_description.xml',
//     ZoneName: 'Kitchen',
//     Icon: 'x-rincon-roomicon:kitchen',
//     Configuration: '1',
//     SoftwareVersion: '47.2-59120',
//     MinCompatibleVersion: '46.0-00000',
//     LegacyCompatibleVersion: '36.0-00000',
//     BootSeq: '674',
//     TVConfigurationError: '0',
//     HdmiCecAvailable: '0',
//     WirelessMode: '1',
//     WirelessLeafOnly: '0',
//     HasConfiguredSSID: '1',
//     ChannelFreq: '2462',
//     BehindWifiExtender: '0',
//     WifiEnabled: '1',
//     Orientation: '0',
//     RoomCalibrationState: '1',
//     SecureRegState: '3',
//     VoiceState: '0',
//     AirPlayEnabled: '1',
//     IdleState: '1' } ]


SonosNetwork.prototype._parseZoneGroups = function parseZoneGroups() {
  if (this.devices.length === 0) { return; }
  console.log('parsing zone groups');
};


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
 
// }

module.exports = SonosNetwork;

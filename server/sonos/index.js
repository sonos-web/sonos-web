const { DeviceDiscovery, Listener } = require('sonos');

const SonosNetwork = function SonosNetwork(socketio) {
  this.socketio = socketio;
  this.devices = [];
  this.zoneGroups = [];
  // Discover the Sonos network on initialization
  this.socketio.on('connection', (socket) => {
    socket.emit('Discovering Sonos Devices');
  });
  this.discover().then(() => {
    // Build the zone groups
    this._parseZoneGroups().then(() => {
      this.socketio.emit('Sonos Device Discovery Complete', this.zoneGroups);
    }).catch(() => {
      this.socketio.emit('No Sonos Devices Found On Network');
    });
    // Now that we have the devices, listen for events on them
    this._listen();
  });
};

/**
 * Get Sonos Devices on the network
 * @param {Number} timeout
 * @returns {Array}
 */
SonosNetwork.prototype.discover = async function discover(timeout = 5000) {
  return new Promise((resolve) => {
    this.socketio.emit('Discovering Sonos Devices');

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

/**
 * Updates this.zoneGroups with the current zone group info
 */
SonosNetwork.prototype._parseZoneGroups = async function parseZoneGroups() {
  return new Promise((resolve, reject) => {
    // If there are no devices, we cannot
    if (this.devices.length === 0) { reject(); }

    const zoneGroups = [];

    this.devices[0].getAllGroups().then((rawGroups) => {
      rawGroups.forEach((group) => {
        zoneGroups.push({
          id: group.ID,
          coordinator: {},
          members: [],
        });
        group.ZoneGroupMember.forEach((member) => {
          const zone = {
            id: member.UUID,
            name: member.ZoneName,
            device: this.devices.find(device => device.id === member.UUID),
          };
          const zoneGroup = zoneGroups.find(zg => zg.id === group.ID);
          if (zone.id === group.Coordinator) {
            zoneGroup.coordinator = zone;
          } else {
            zoneGroup.members.push(zone);
          }
        });
      });
      // Sort all the members of each zone alphabetically
      // eslint-disable-next-line max-len
      zoneGroups.map(group => group.members.sort((member1, member2) => member1.name > member2.name));
      // Sort all the zones alphabetically by coordinator
      zoneGroups.sort((group1, group2) => group1.coordinator.name > group2.coordinator.name);

      this.zoneGroups = zoneGroups;
      resolve(this.zoneGroups);
    }).catch((error) => {
      reject(error);
    });
  });
};

module.exports = SonosNetwork;

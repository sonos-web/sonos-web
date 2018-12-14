const { DeviceDiscovery, Listener } = require('sonos');

const SonosNetwork = function SonosNetwork(socketio, timeout = 5000) {
  this.socketio = socketio;
  this.devices = [];
  this.zoneGroups = [];
  this.timeout = timeout;
  // Discover the Sonos network on connection
  this.socketio.on('connection', () => {
    if (this.devices.length === 0) {
      this.discover(timeout).then(() => {
        // Build the zone groups
        this._parseZoneGroups().then(() => {
          this.socketio.emit('Sonos Device Discovery Complete', this.zoneGroups);
        }).catch(() => {
          this.socketio.emit('No Sonos Devices Found On Network');
        });
        // Now that we have the devices, listen for events on them
        this._listen();
      });
    } else {
      this.socketio.emit('Sonos Device Discovery Complete', this.zoneGroups);
    }
  });
};

/**
 * Get Sonos Devices on the network
 * Can we improve this? There should be a way to return quicker once all the devices are found...
 * @param {Number} timeout
 * @returns {Array}
 */
SonosNetwork.prototype.discover = async function discover() {
  return new Promise((resolve) => {
    this.socketio.emit('Discovering Sonos Devices');

    const sonosSearch = DeviceDiscovery({ timeout: this.timeout });

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
 * Listen to events for all Sonos devices on the network (ex. Play, Next Track, Mute, Volume, etc.)
 * And listen to any changes to Sonos ZoneGroupTopology (Grouping Rooms)
 */
SonosNetwork.prototype._listen = function listen() {
  this.devices.forEach((device) => {
    // We don't use the data returned, because it is insufficent
    // We need more than it provides
    device.on('AVTransport', () => {
      this.getAVTransportInfo(device).then((transportInfo) => {
        this.socketio.emit('Sonos Event Data Received', { deviceId: device.id, update: transportInfo });
        this._updateZoneGroup(device.id, transportInfo);
      });
    });
    device.on('RenderingControl', () => {
      this.getRenderingControlInfo(device).then((renderingInfo) => {
        this.socketio.emit('Sonos Event Data Received', { deviceId: device.id, update: renderingInfo });
        this._updateZoneGroup(device.id, renderingInfo);
      });
    });
  });

  Listener.on('ZonesChanged', (zoneData) => {
    if (zoneData) {
      // const zones = JSON.parse(JSON.stringify(zoneData, ' ', 2));
      this._parseZoneGroups().then(() => {
        this.socketio.emit('Sonos Device Discovery Complete', this.zoneGroups);
      }).catch(() => {
        this.socketio.emit('No Sonos Devices Found On Network');
      });
    }
  });
};

/**
 * Update(merge) internal zone group with new data
 * @param {String} deviceId
 * @param {Object} data
 */
SonosNetwork.prototype._updateZoneGroup = function _updateZoneGroup(deviceId, data) {
  const index = this.zoneGroups.findIndex(group => group.coordinator.id === deviceId);
  // Merge new data in
  this.zoneGroups[index] = { ...this.zoneGroups[index], ...data };
};

/**
 * Returns RenderingControlInfo
 * @param {Sonos} device
 * @returns {Object}
 */
SonosNetwork.prototype.getRenderingControlInfo = async function getRenderingControlInfo(device) {
  const volume = await device.renderingControlService().GetVolume();
  const mute = await device.renderingControlService().GetMute();
  return {
    volume,
    mute,
  };
};

/**
 * Returns AVTransportInfo
 * @param {Sonos} device
 * @returns {Object}
 */
SonosNetwork.prototype.getAVTransportInfo = async function getAVTransportInfo(device) {
  /**
   * PlayMode
   * RecQualityMode
   */
  const transportSettings = await device.avTransportService().GetTransportSettings();
  /**
   * CurrentTransportState
   * CurrentTransportStatus
   * CurrentSpeed
   */
  const transportInfo = await device.avTransportService().GetTransportInfo();

  /**
   * Actions
   */
  const transportActions = await device.avTransportService().GetCurrentTransportActions();

  /**
   * title
   * artist
   * album
   * albumArtURI
   * position
   * duration
   * albumArtURL
   * uri
   * queuePosition
   */
  const currentTrack = await device.avTransportService().CurrentTrack();

  return {
    track: currentTrack,
    state: transportInfo.CurrentTransportState,
    playMode: transportSettings.PlayMode,
    actions: transportActions.Actions,
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

    this.devices[0].getAllGroups().then(async (rawGroups) => {
      rawGroups.forEach((group) => {
        zoneGroups.push({
          id: group.ID,
          coordinator: {},
          members: [],
        });
        group.ZoneGroupMember.forEach(async (member) => {
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

      // Fetch the transport info for all zones
      await Promise.all(zoneGroups.map(async (group, index) => {
        const transportInfo = await this.getAVTransportInfo(group.coordinator.device);
        const renderingInfo = await this.getRenderingControlInfo(group.coordinator.device);
        // merge transportInfo in with zoneGroup
        zoneGroups[index] = { ...group, ...transportInfo, ...renderingInfo };
      }));

      // Sort all the members of each zone alphabetically
      // eslint-disable-next-line max-len
      zoneGroups.forEach(group => group.members.sort((member1, member2) => member1.name > member2.name));
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

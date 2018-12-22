const { DeviceDiscovery, Listener } = require('sonos');

const SonosNetwork = function SonosNetwork(socketio, timeout = 5000) {
  this.socketio = socketio;
  this.devices = [];
  this.zoneGroups = [];
  this.timeout = timeout;
  this.initializing = true;

  this.init();

  this.socketio.on('connection', () => {
    if (this.initializing) {
      this.socketio.emit('Discovering Sonos Devices');
    } else if (this.devices.length === 0) {
      this.init();
    } else {
      this.socketio.emit('Sonos Device Discovery Complete', this.zoneGroups);
    }
  });
};

/**
 * Initialize by discovering the Sonos Network and parsing the zone groups
 */
SonosNetwork.prototype.init = function init() {
  this.initializing = true;
  this.discover(this.timeout).then(() => {
    // Build the zone groups
    this._parseZoneGroups().then(() => {
      this.socketio.emit('Sonos Device Discovery Complete', this.zoneGroups);
      this.initializing = false;
    }).catch((error) => {
      this.initializing = false;
      console.log(error);
      if (error.message === 'No Devices Found') {
        this.socketio.emit('No Sonos Devices Found On Network');
      } else {
        this.socketio.emit('An Unknown Error Occurred While Retrieving Devices', JSON.stringify(error, Object.getOwnPropertyNames(error)));
      }
    });
    // Now that we have the devices, listen for events on them
    this._listen();
  });
};

/**
 * Get Sonos Devices on the network
 * Can we improve this? There should be a way to return quicker once all the devices are found...
 * @param {Number} timeout
 * @returns {Array} All devices found on the network
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
        // Find the zone group this device is in
        const zoneGroup = this.zoneGroups.find(zg => zg.coordinator.id === device.id);
        if (zoneGroup) {
          this.socketio.emit('Sonos Event Data Received', { groupId: zoneGroup.id, update: transportInfo });
          this._updateZoneGroupTransportInfo(device.id, transportInfo);
        }
      });
    });
    device.on('RenderingControl', () => {
      this.getRenderingControlInfo(device).then((renderingInfo) => {
        const zoneGroup = this._zoneGroupForDeviceId(device.id);
        if (zoneGroup) {
          // eslint-disable-next-line max-len
          const updatedZone = this._updateZoneGroupRenderingInfo(zoneGroup.id, device.id, renderingInfo);
          if (updatedZone) {
            this.socketio.emit('Sonos Event Data Received', { groupId: updatedZone.id, update: updatedZone });
          }
        }
      });
    });
  });

  Listener.on('ZonesChanged', (zoneData) => {
    if (zoneData) {
      // const zones = JSON.parse(JSON.stringify(zoneData, ' ', 2));
      this._parseZoneGroups().then(() => {
        this.socketio.emit('Sonos Device Discovery Complete', this.zoneGroups);
      }).catch((error) => {
        console.log(error);
        if (error.message === 'No Devices Found') {
          this.socketio.emit('No Sonos Devices Found On Network');
        } else {
          this.socketio.emit('An Unknown Error Occurred While Retrieving Devices', JSON.stringify(error, Object.getOwnPropertyNames(error)));
        }
      });
    }
  });
};

/**
 * Resume/Play current queue for provided group
 * @param {String} groupId
 */
SonosNetwork.prototype.play = async function play(groupId) {
  const group = this.zoneGroups.find(zg => zg.id === groupId);
  if (group) await group.coordinator.device.play();
};

/**
 * Pause current queue for provided group
 * @param {String} groupId
 */
SonosNetwork.prototype.pause = async function pause(groupId) {
  const group = this.zoneGroups.find(zg => zg.id === groupId);
  if (group) await group.coordinator.device.pause();
};

/**
 * Play next in queue for provided group
 * @param {String} groupId
 */
SonosNetwork.prototype.next = async function next(groupId) {
  const group = this.zoneGroups.find(zg => zg.id === groupId);
  if (group) await group.coordinator.device.next();
};

/**
 * Play previous in queue for provided group
 * @param {String} groupId
 */
SonosNetwork.prototype.previous = async function previous(groupId) {
  const group = this.zoneGroups.find(zg => zg.id === groupId);
  if (group) await group.coordinator.device.previous();
};

/**
 * Seek in the current track to the time given in seconds
 * @param {String} groupId
 * @param {Number} seconds jump to x seconds
 */
SonosNetwork.prototype.seek = async function seek(groupId, seconds) {
  const group = this.zoneGroups.find(zg => zg.id === groupId);
  if (group) await group.coordinator.device.seek(seconds);
};

/**
 * Set the volume for a specific zone
 * @param {String} zoneId
 * @param {Number} volume
 */
SonosNetwork.prototype.setVolume = async function setVolume(zoneId, volume) {
  const zone = this.devices.find(device => device.id === zoneId);
  await zone.setVolume(volume);
};

/**
 * Set the volume of all zones in a group as a percentage of the group volume given
 *
 * Will modify each zones' volume based on its previous volume as a percentage
 * of the new group volume
 *
 * Group volume is simply an average of all the volumes of its members.
 * It only exists as a calculated value, not a real one.
 * @param {String} groupId
 * @param {Number} volume The average volume for the group
 */
SonosNetwork.prototype.setGroupVolume = async function setGroupVolume(groupId, volume) {
  const group = this.zoneGroups.find(zg => zg.id === groupId);
  const zones = [group.coordinator, ...group.members];
  const currentVolume = group.volume;
  // If the volume is zero we don't want to divide by 0 -- (NaN)
  // We want to divide by 1
  const volumeDivisor = currentVolume === 0 ? 1 : currentVolume;
  const volumeChangePercentage = 1 + ((volume - currentVolume) / volumeDivisor);
  await Promise.all(zones.map(async (zone) => {
    let zoneVolume = await zone.device.getVolume();
    // Anything multiplid by zero is zero...we would never be able to
    // increase the volume, so change it to 1
    zoneVolume = zoneVolume === 0 ? 1 : zoneVolume;
    // round the volume...needs to be an int
    let newVolume = Math.round(zoneVolume * volumeChangePercentage);
    // clamp volume between 0 and 100
    newVolume = Math.max(0, Math.min(newVolume, 100));
    await zone.device.setVolume(newVolume);
  }));
};

/**
 * Set mute for a specific zone
 * @param {String} zoneId
 * @param {Number} mute
 */
SonosNetwork.prototype.setMute = async function setMute(zoneId, mute) {
  const zone = this.devices.find(device => device.id === zoneId);
  await zone.setMuted(mute);
};

/**
 * Set group mute for all the speakers
 * @param {String} groupId
 * @param {Number} mute
 */
SonosNetwork.prototype.setGroupMute = async function setGroupMute(groupId, mute) {
  const group = this.zoneGroups.find(zg => zg.id === groupId);
  [group.coordinator, ...group.members].map(async (member) => {
    await member.device.setMuted(mute);
  });
};

/**
 * Join a zone to a group
 * @param {String} groupId
 * @param {String} zoneId
 */
SonosNetwork.prototype.joinGroup = async function joinGroup(groupId, zoneId) {
  const zone = this.devices.find(device => device.id === zoneId);
  const group = this.zoneGroups.find(zg => zg.id === groupId);
  await zone.setAVTransportURI({ uri: `x-rincon:${group.coordinator.id}`, onlySetUri: true });
};

/**
 * Ungroup zone from zoneGroup. Zone will become coordinator of its own group
 * @param {String} zoneId
 */
SonosNetwork.prototype.leaveGroup = async function leaveGroup(zoneId) {
  const zone = this.devices.find(device => device.id === zoneId);
  await zone.leaveGroup();
};

/**
 *  Join all zones to the group specified
 * @param {String} groupId
 */
SonosNetwork.prototype.partyMode = async function partyMode(groupId) {
  const group = this.zoneGroups.find(zg => zg.id === groupId);
  await Promise.all(this.devices.map(async (device) => {
    if (device.id !== group.coordinator.id) {
      await device.setAVTransportURI({ uri: `x-rincon:${group.coordinator.id}`, onlySetUri: true });
    }
  }));
};

/**
 * Ungroup all zones
 */
SonosNetwork.prototype.ungroupAllZones = async function ungroupAllZones() {
  // eslint-disable-next-line no-restricted-syntax
  for (const device of this.devices) {
    // eslint-disable-next-line no-await-in-loop
    await device.leaveGroup();
  }
};

/**
 * Update(merge) internal zone group with new AVTransport data
 * @param {String} deviceId
 * @param {Object} data
 */
// eslint-disable-next-line max-len
SonosNetwork.prototype._updateZoneGroupTransportInfo = function _updateZoneGroupTransportInfo(deviceId, data) {
  const index = this.zoneGroups.findIndex(group => group.coordinator.id === deviceId);
  if (index !== -1) {
    // Merge new data in
    this.zoneGroups[index] = { ...this.zoneGroups[index], ...data };
  }
};

/**
 * Returns Updated(merged) internal zone group with new RenderingControl data
 * @param {String} memberId The device/member id
 * @param {Object} data
 * @returns {Object|null} ZoneGroup or null
 */
// eslint-disable-next-line max-len
SonosNetwork.prototype._updateZoneGroupRenderingInfo = function _updateZoneGroupRenderingInfo(groupId, memberId, data) {
  const index = this.zoneGroups.findIndex(zg => zg.id === groupId);
  if (index !== -1) {
    // Merge the data into the coordinator if it matches the given memberId
    if (this.zoneGroups[index].coordinator.id === memberId) {
      this.zoneGroups[index].coordinator = { ...this.zoneGroups[index].coordinator, ...data };
    } else {
      // otherwise merge it into one of the members
      const mIndex = this.zoneGroups[index].members.findIndex(member => member.id === memberId);
      if (mIndex !== -1) {
        this.zoneGroups[index].members[mIndex] = {
          ...this.zoneGroups[index].members[mIndex],
          ...data,
        };
      }
    }
    // finally, update the zone group mute & volume
    const renderingInfo = this.getGroupRenderingControlInfo(this.zoneGroups[index]);
    this.zoneGroups[index] = { ...this.zoneGroups[index], ...renderingInfo };
    return this.zoneGroups[index];
  }
  return null;
};

/**
 * Returns group rendering control data based on its members' values
 * @param {String} group The zoneGroup to query
 * @returns {Object}
 */
// eslint-disable-next-line max-len
SonosNetwork.prototype.getGroupRenderingControlInfo = function getGroupRenderingControlInfo(group) {
  const zones = [group.coordinator, ...group.members];
  // Group will be NOT muted if at least one zone is not muted
  const mute = !zones.some(zone => !zone.mute);
  // Average of all volumes
  // eslint-disable-next-line arrow-body-style
  const volumeSum = zones.reduce((accumulator, current) => {
    return (accumulator.volume + current.volume);
  });
  // If there is only one element in zones array, it will return the object
  // otherwise we will have a number in volumeSum
  const volume = typeof (volumeSum) === 'object' ? volumeSum.volume : Math.floor(volumeSum / zones.length);

  return { volume, mute };
};

/**
 * Returns RenderingControlInfo
 * @param {Sonos} device
 * @returns {Object} RenderingControlInfo
 */
SonosNetwork.prototype.getRenderingControlInfo = async function getRenderingControlInfo(device) {
  const volume = await device.renderingControlService().GetVolume();
  const mute = await device.renderingControlService().GetMute();
  return {
    volume,
    mute,
  };
};

SonosNetwork.prototype.getTrackPosition = async function getTrackPosition(groupId) {
  const group = this.zoneGroups.find(zg => zg.id === groupId);
  if (group) {
    const track = await group.coordinator.device.avTransportService().CurrentTrack();
    return track.position;
  }
  return null;
};

/**
 * Returns AVTransportInfo
 * @param {Sonos} device
 * @returns {Object} AVTransportInfo
 */
SonosNetwork.prototype.getAVTransportInfo = async function getAVTransportInfo(device) {
  /**
   * PlayMode - NORMAL, SUFFLE_NOREPEAT, SHUFFLE, REPEAT_ALL, SHUFFLE_REPEAT_ONE, REPEAT_ONE
   * RecQualityMode
   */
  const transportSettings = await device.avTransportService().GetTransportSettings();
  /**
   * CurrentTransportState - PLAYING, PAUSED_PLAYBACK, TRANSITIONING, STOPPED
   * CurrentTransportStatus - OK, ?
   * CurrentSpeed - 1, ?
   */
  const transportInfo = await device.avTransportService().GetTransportInfo();

  /**
   * Actions - Set, Stop, Pause, Play, X_DLNA_SeekTime, Next, Previous, X_DLNA_SeekTrackNr
   */
  const transportActions = await device.avTransportService().GetCurrentTransportActions();

  /**
   * Track
   * TrackDuration
   * TrackMetaData
   * TrackURI
   * RelTime
   * AbsTime
   * RelCount
   * AbsCount
   */
  const positionInfo = await device.avTransportService().GetPositionInfo();

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

  const tvPlaying = positionInfo.TrackURI.match(/^x-sonos-htastream:/) !== null;

  return {
    track: currentTrack,
    state: transportInfo.CurrentTransportState,
    playMode: transportSettings.PlayMode,
    actions: transportActions.Actions.split(', '),
    tvPlaying,
  };
};

/**
 * Updates this.zoneGroups with the current zone group info
 */
SonosNetwork.prototype._parseZoneGroups = async function _parseZoneGroups() {
  return new Promise((resolve, reject) => {
    // If there are no devices, we cannot
    if (this.devices.length === 0) { reject(new Error('No Devices Found')); }

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
        // Get rendering info for coordinator & each device in the group
        zoneGroups[index].coordinator = {
          ...group.coordinator,
          ...await this.getRenderingControlInfo(group.coordinator.device),
        };
        await Promise.all(group.members.map(async (member, mIndex) => {
          zoneGroups[index].members[mIndex] = {
            ...member,
            ...await this.getRenderingControlInfo(member.device),
          };
        }));

        const renderingInfo = this.getGroupRenderingControlInfo(group);
        // merge data in with zoneGroup
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

/**
 * Returns the zone group that a device belongs to
 * @param {String} deviceId
 * @returns {Object|null} Zone Group found for the given deviceId or null
 */
SonosNetwork.prototype._zoneGroupForDeviceId = function _zoneGroupForDeviceId(deviceId) {
  let zoneGroup = this.zoneGroups.find(zg => zg.coordinator.id === deviceId);
  if (!zoneGroup) {
    // eslint-disable-next-line arrow-body-style
    zoneGroup = this.zoneGroups.find((zg) => {
      return zg.members.findIndex(member => member.device.id === deviceId) > -1;
    });
  }
  return zoneGroup || null;
};

module.exports = SonosNetwork;

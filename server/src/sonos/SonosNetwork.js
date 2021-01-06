const { DeviceDiscovery, Listener, SpotifyRegion, Helpers } = require('sonos');
const { NoDevicesFound } = require('./SonosNetworkErrors');
const {
  DiscoveringSonosDevices,
  SonosDeviceDiscoveryComplete,
  NoSonosDevicesFound,
  UnknownErrorWhileRetrievingDevices,
  SonosEventDataReceived,
} = require('./Messages');
const MusicLibrary = require('./MusicLibrary');

class SonosNetwork {
  constructor(socketio, timeout = 5000) {
    this.socketio = socketio;
    this.devices = [];
    this.zoneGroups = [];
    this.timeout = timeout;
    this.initializing = true;
    this.listener = Listener;
    this.musicLibrary = null;

    this._init();
    this.socketio.on('connection', () => {
      if (this.initializing) {
        this.socketio.emit(DiscoveringSonosDevices);
      } else if (this.zoneGroups.length === 0) {
        this._init();
      } else {
        this.socketio.emit(SonosDeviceDiscoveryComplete, this.zoneGroups);
      }
    });
  }

  /*
   *************************************************************************************************
   *************************************************************************************************
   * SONOS DISCOVERY AND EVENTS
   *************************************************************************************************
   *************************************************************************************************
   */

  /**
   * Initialize by discovering the Sonos Network and parsing the zone groups
   */
  _init() {
    this.initializing = true;
    this._discover(this.timeout).then((devices) => {
      if (!this.musicLibrary) {
        this.musicLibrary = new MusicLibrary(devices[0]);
      }
      // Build the zone groups
      this._parseZoneGroups().then(() => {
        this.socketio.emit(SonosDeviceDiscoveryComplete, this.zoneGroups);
        this.initializing = false;
      }).catch((error) => {
        this.initializing = false;
        console.log(error);
        if (error.message === NoDevicesFound) {
          this.socketio.emit(NoSonosDevicesFound);
        } else {
          this.socketio.emit(
            UnknownErrorWhileRetrievingDevices,
            JSON.stringify(error, Object.getOwnPropertyNames(error)),
          );
        }
      });
      // Now that we have the devices, listen for events on them
      this._listen();
    });
  }

  /**
 * Get Sonos Devices on the network
 * Can we improve this? There should be a way to return quicker once all the devices are found...
 * @param {Number} timeout
 * @returns {Array} All devices found on the network
 */
  async _discover() {
    return new Promise((resolve) => {
      this.socketio.emit(DiscoveringSonosDevices);
      this.devices = [];
      const sonosSearch = DeviceDiscovery({ timeout: this.timeout });

      sonosSearch.on('DeviceAvailable', async (sonosDevice) => {
        const device = sonosDevice;
        device.deviceDescription().then((description) => {
          device.name = description.roomName;
          device.displayName = description.displayName;
          if (process.env.REGION) {
            if (process.env.REGION in SpotifyRegion) {
              device.setSpotifyRegion(SpotifyRegion[process.env.REGION]);
              console.log(`Setting spotify region to ${process.env.REGION}`);
            } else {
              console.error(`Specified region ${process.env.REGION} is not valid`);
            }
          }
          const UUID = description.UDN.split('uuid:')[1];
          device.id = UUID;
          this.listener.subscribeTo(device).then(() => {
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
  }

  /**
   * Listen to events for all Sonos devices on the network (ex. Play, Mute, Volume,
   * Queue Change, Seek, etc.)
   * And listen to any changes to Sonos ZoneGroupTopology (Grouping Rooms)
   */
  _listen() {
    // Device specific events
    this.devices.forEach((device) => {
      // We don't use the data returned, because it is insufficent
      // We need more than it provides
      device.on('AVTransport', () => { this._onAVTransportEvent(device); });
      device.on('RenderingControl', () => { this._onRenderingControlEvent(device); });
      device.on('QueueChanged', () => { this._onQueueChangedEvent(device); });
    });
    // Global events
    this.listener.on('ZonesChanged', (zoneData) => { this._onZonesChangedEvent(zoneData); });
  }

  _onAVTransportEvent(device) {
    // Find the zone group, we only care if it is the coordinator
    const zoneGroup = this.zoneGroups.find(zg => zg.coordinator.id === device.id);
    if (zoneGroup) {
      this._getAVTransportInfo(device.id).then((transportInfo) => {
        this.socketio.emit(
          SonosEventDataReceived,
          { groupId: zoneGroup.id, update: transportInfo },
        );
        this._updateZoneGroupTransportInfo(device.id, transportInfo);
      });
    }
  }

  _onRenderingControlEvent(device) {
    this._getRenderingControlInfo(device.id).then((renderingInfo) => {
      const zoneGroup = this._zoneGroupForDeviceId(device.id);
      if (zoneGroup) {
        // eslint-disable-next-line max-len
        const updatedZone = this._updateZoneGroupRenderingInfo(zoneGroup.id, device.id, renderingInfo);
        // We don't want to send this field, because it can cause a
        // jumpy track position when adjust volume
        delete updatedZone.track;
        if (updatedZone) {
          this.socketio.emit(
            SonosEventDataReceived,
            { groupId: updatedZone.id, update: updatedZone },
          );
        }
      }
    });
  }

  _onQueueChangedEvent(device) {
    // Find the zone group, we only care if it is the coordinator
    const zoneGroup = this.zoneGroups.find(zg => zg.coordinator.id === device.id);
    if (zoneGroup) {
      this._getQueue(device.id).then((queue) => {
        this.socketio.emit(SonosEventDataReceived, { groupId: zoneGroup.id, update: { queue } });
        this._updateZoneGroupTransportInfo(device.id, { queue });
      });
    }
  }

  _onZonesChangedEvent(zoneData) {
    if (!zoneData) { return; }
    // const zones = JSON.parse(JSON.stringify(zoneData, ' ', 2));
    this._parseZoneGroups().then(() => {
      this.socketio.emit(SonosDeviceDiscoveryComplete, this.zoneGroups);
    }).catch((error) => {
      console.log(error);
      if (error.message === NoDevicesFound) {
        this.socketio.emit(NoSonosDevicesFound);
      } else {
        this.socketio.emit(
          UnknownErrorWhileRetrievingDevices,
          JSON.stringify(error, Object.getOwnPropertyNames(error)),
        );
      }
    });
  }

  /*
   *************************************************************************************************
   *************************************************************************************************
   * PUBLIC SONOS DEVICE & GROUP CONTROL FUNCTIONS
   *************************************************************************************************
   *************************************************************************************************
   */

  /**
   * Resume/Play current queue for provided group
   * @param {String} groupId
   */
  async play(groupId) {
    const group = this.zoneGroups.find(zg => zg.id === groupId);
    try {
      if (group) await group.coordinator.device.play();
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * Pause current queue for provided group
   * @param {String} groupId
   */
  async pause(groupId) {
    const group = this.zoneGroups.find(zg => zg.id === groupId);
    if (group) await group.coordinator.device.pause();
  }

  /**
   * Play next in queue for provided group
   * @param {String} groupId
   */
  async next(groupId) {
    const group = this.zoneGroups.find(zg => zg.id === groupId);
    if (group) await group.coordinator.device.next();
  }

  /**
   * Play previous in queue for provided group
   * @param {String} groupId
   */
  async previous(groupId) {
    const group = this.zoneGroups.find(zg => zg.id === groupId);
    if (group) await group.coordinator.device.previous();
  }

  /**
   * Seek in the current track to the time given in seconds
   * @param {String} groupId
   * @param {Number} seconds jump to x seconds
   */
  async seek(groupId, seconds) {
    const group = this.zoneGroups.find(zg => zg.id === groupId);
    if (group) await group.coordinator.device.seek(seconds);
  }

  /**
   * Returns the current track position in seconds
   * @param {String} groupId
   * @returns {Number}
   */
  async getTrackPosition(groupId) {
    const group = this.zoneGroups.find(zg => zg.id === groupId);
    if (group) {
      const track = await group.coordinator.device.avTransportService().CurrentTrack();
      return track.position;
    }
    return null;
  }

  /**
   * Set the play mode for a group
   * @param {String} groupId
   * @param {Number} volume
   */
  async setPlayMode(groupId, playMode) {
    const group = this.zoneGroups.find(zg => zg.id === groupId);
    await group.coordinator.device.setPlayMode(playMode);
  }

  /**
   * Set the volume for a specific zone
   * @param {String} zoneId
   * @param {Number} volume
   */
  async setVolume(zoneId, volume) {
    const zone = this.devices.find(device => device.id === zoneId);
    await zone.setVolume(volume);
  }

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
  async setGroupVolume(groupId, volume) {
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
  }

  /**
   * Set mute for a specific zone
   * @param {String} zoneId
   * @param {Number} mute
   */
  async setMute(zoneId, mute) {
    const zone = this.devices.find(device => device.id === zoneId);
    await zone.setMuted(mute);
  }

  /**
   * Set group mute for all the speakers
   * @param {String} groupId
   * @param {Number} mute
   */
  async setGroupMute(groupId, mute) {
    const group = this.zoneGroups.find(zg => zg.id === groupId);
    [group.coordinator, ...group.members].map(async (member) => {
      await member.device.setMuted(mute);
    });
  }

  /**
   * Reorder tracks in queue for group
   * @param {String} groupId
   * @param {Number} oldIndex - 0-based index of the track to move
   * @param {Number} newIndex - 0-based index of where to move the track
   */
  async reorderTracksInQueue(groupId, oldIndex, newIndex) {
    const group = this.zoneGroups.find(zg => zg.id === groupId);
    // Add 1 to each index, because Sonos expects 1 based, not 0 based index
    const from = oldIndex + 1;
    let to = newIndex + 1;
    // We need to add 1 because, 'to' is actually insertBefore and when we are
    // moving a track further down the list, we need to transform
    // the 'to' value into a proper insertBefore value
    if (to > from) to += 1;
    group.coordinator.device.reorderTracksInQueue(from, 1, to);
  }

  /**
   * Remove array of tracks from queue
   * @param {String} groupId
   * @param {Array} trackIndexes - Array of 0-based indexes to be removed from queue
   */
  async removeTracksFromQueue(groupId, trackIndexes) {
    const group = this.zoneGroups.find(zg => zg.id === groupId);
    const indexes = trackIndexes.sort((a, b) => b - a);
    // eslint-disable-next-line no-restricted-syntax
    for (const queuePosition of indexes) {
      // must add 1 to each index, because Sonos expects it to be 1 based, not 0 based.
      const removeIndex = queuePosition + 1;
      // eslint-disable-next-line no-await-in-loop
      await group.coordinator.device.removeTracksFromQueue(removeIndex);
    }
  }

  /**
   * Save current queue for group
   * @param {String} groupId
   * @param {String} playlistTitle
   */
  async saveQueue(groupId, playlistTitle) {
    const group = this.zoneGroups.find(zg => zg.id === groupId);
    const options = { InstanceID: 0, Title: playlistTitle, ObjectID: '' };
    try {
      await group.coordinator.device.avTransportService().SaveQueue(options);
    } catch (error) {
      throw (error);
    }
  }

  /**
   * Clear current queue for group
   * @param {String} groupId
   */
  async clearQueue(groupId) {
    const group = this.zoneGroups.find(zg => zg.id === groupId);
    await group.coordinator.device.flush();
  }

  /**
   * Play a track from the queue
   * @param {String} groupId
   * @param {Number} trackNumber - 1-based index of the track to play
   */
  async playTrackFromQueue(groupId, trackNumber) {
    const group = this.zoneGroups.find(zg => zg.id === groupId);
    await group.coordinator.device.selectQueue();
    await group.coordinator.device.selectTrack(trackNumber);
    await group.coordinator.device.play();
  }

  /**
   * Play the uri now, after the currently queued item
   * @param {String} groupId
   * @param {Object} data - The data to build the uri
   */
  async playNow(groupId, data) {
    const group = this.zoneGroups.find(zg => zg.id === groupId);
    const uri = await this._getURIFromData(group.coordinator.id, data);
    try {
      if (uri) {
        if (uri.indexOf('x-sonosapi-radio:') !== -1) {
          await group.coordinator.device.setAVTransportURI({ uri });
        } else if (uri.indexOf('x-sonosapi-stream:') !== -1) {
          const metadata = Helpers.GenerateMetadata(uri);
          await group.coordinator.device.setAVTransportURI(metadata);
        } else {
          const mediaInfo = await group.coordinator.device.avTransportService().GetMediaInfo();
          if (mediaInfo && mediaInfo.CurrentURI && !mediaInfo.CurrentURI.startsWith('x-rincon-queue:')) {
            group.coordinator.device.setAVTransportURI(`x-rincon-queue:${group.coordinator.device.id}#0`);
          }
          const queuePosition = group.queue
            ? Math.max(...group.queue.map((item) => item.queuePosition)) + 1 : 1;
          await group.coordinator.device.queue(uri, queuePosition);
          await group.coordinator.device.selectTrack(queuePosition);
          await group.coordinator.device.play();
        }
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  /**
   * Add the uri after the currently queued item
   * @param {String} groupId
   * @param {String} data - The data to build the uri
   */
  async playNext(groupId, data) {
    const group = this.zoneGroups.find(zg => zg.id === groupId);
    const uri = await this._getURIFromData(group.coordinator.id, data);
    if (uri) {
      const queuePosition = group.queue
        ? Math.max(...group.queue.map((item) => item.queuePosition)) + 1 : 1;
      await group.coordinator.device.queue(uri, queuePosition);
    }
  }

  /**
   * Add a uri to the end of the queue
   * @param {String} groupId
   * @param {String} data - The data to build the uri
   */
  async addToEndOfQueue(groupId, data) {
    const group = this.zoneGroups.find(zg => zg.id === groupId);
    const uri = await this._getURIFromData(group.coordinator.id, data);
    if (uri) {
      await group.coordinator.device.queue(uri);
    }
  }

  /**
   * Clear the queue and play the given uri
   * @param {String} groupId
   * @param {String} data - The data to build the uri
   */
  async replaceQueueAndPlay(groupId, data) {
    const group = this.zoneGroups.find(zg => zg.id === groupId);
    const uri = await this._getURIFromData(group.coordinator.id, data);
    if (uri) {
      const trackNumber = data.songNumber || 1;
      await group.coordinator.device.flush();
      await group.coordinator.device.queue(uri);
      await group.coordinator.device.selectQueue();
      await group.coordinator.device.selectTrack(trackNumber);
      await group.coordinator.device.play();
    }
  }

  /**
   * Join a zone to a group
   * @param {String} groupId
   * @param {String} zoneId
   */
  async joinGroup(groupId, zoneId) {
    const zone = this.devices.find(device => device.id === zoneId);
    const group = this.zoneGroups.find(zg => zg.id === groupId);
    await zone.setAVTransportURI({ uri: `x-rincon:${group.coordinator.id}`, onlySetUri: true });
  }

  /**
   * Ungroup zone from zoneGroup. Zone will become coordinator of its own group
   * @param {String} zoneId
   */
  async leaveGroup(zoneId) {
    const zone = this.devices.find(device => device.id === zoneId);
    await zone.leaveGroup();
  }

  /**
   *  Join all zones to the group specified - AKA Party Mode
   * @param {String} groupId
   */
  async partyMode(groupId) {
    const group = this.zoneGroups.find(zg => zg.id === groupId);
    await Promise.all(this.devices.map(async (device) => {
      if (device.id !== group.coordinator.id) {
        await device.setAVTransportURI({ uri: `x-rincon:${group.coordinator.id}`, onlySetUri: true });
      }
    }));
  }

  /**
   * Ungroup all zones - AKA Diable Party Mode
   */
  async ungroupAllZones() {
    // eslint-disable-next-line no-restricted-syntax
    for (const device of this.devices) {
      // eslint-disable-next-line no-await-in-loop
      await device.leaveGroup();
    }
  }

  /*
   *************************************************************************************************
   *************************************************************************************************
   * PRIVATE MUTATION FUNCTIONS
   *************************************************************************************************
   *************************************************************************************************
   */

  /**
   * Update(merge) internal zone group with new AVTransport data
   * @param {String} deviceId
   * @param {Object} data
   */
  _updateZoneGroupTransportInfo(deviceId, data) {
    const index = this.zoneGroups.findIndex(group => group.coordinator.id === deviceId);
    if (index !== -1) {
    // Merge new data in
      this.zoneGroups[index] = { ...this.zoneGroups[index], ...data };
    }
  }

  /**
   * Returns Updated(merged) internal zone group with new RenderingControl data
   * @param {String} memberId The device/member id
   * @param {Object} data
   * @returns {Object|null} ZoneGroup or null
   */
  _updateZoneGroupRenderingInfo(groupId, memberId, data) {
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
      const renderingInfo = SonosNetwork._getGroupRenderingControlInfo(this.zoneGroups[index]);
      this.zoneGroups[index] = { ...this.zoneGroups[index], ...renderingInfo };
      return this.zoneGroups[index];
    }
    return null;
  }

  /**
   * Updates this.zoneGroups with the current zone group info
   * Called upon initialization or when ZonesChanged event is triggered
   */
  async _parseZoneGroups() {
    return new Promise((resolve, reject) => {
      // If there are no devices, we cannot continue
      if (this.devices.length === 0) { reject(new Error(NoDevicesFound)); }
      let zoneGroups = [];

      this.devices[0].getAllGroups().then(async (rawGroups) => {
        rawGroups.forEach((rg) => {
          const group = rg;
          zoneGroups.push({
            id: group.ID,
            coordinator: {},
            members: [],
          });

          // For some reason group.ZoneGroupMember might not be an array,
          // so we coerce it into one if it is not
          if (!Array.isArray(group.ZoneGroupMember)) {
            group.ZoneGroupMember = [group.ZoneGroupMember];
          }
          group.ZoneGroupMember.forEach(async (member) => {
            const zone = {
              id: member.UUID,
              name: member.ZoneName,
              device: this.devices.find(device => device.id === member.UUID),
            };
            if (zone.device) {
              const zoneGroup = zoneGroups.find(zg => zg.id === group.ID);
              if (zone.id === group.Coordinator) {
                zoneGroup.coordinator = zone;
              } else {
                zoneGroup.members.push(zone);
              }
            }
          });
        });

        // A zone group could be without a coordinator if the Sonos player
        // was previously part of the network, but has been unplugged, etc.
        // For now, we simply eliminate these
        zoneGroups = zoneGroups.filter(group => group.coordinator.device !== undefined);

        // Fetch the transport info for all zones
        await Promise.all(zoneGroups.map(async (group, index) => {
          const transportInfo = await this._getAVTransportInfo(group.coordinator.id);
          const queue = await this._getQueue(group.coordinator.id);
          // Get rendering info for coordinator & each device in the group
          zoneGroups[index].coordinator = {
            ...group.coordinator,
            ...await this._getRenderingControlInfo(group.coordinator.id),
          };
          await Promise.all(group.members.map(async (member, mIndex) => {
            zoneGroups[index].members[mIndex] = {
              ...member,
              ...await this._getRenderingControlInfo(member.id),
            };
          }));

          const renderingInfo = SonosNetwork._getGroupRenderingControlInfo(group);
          // merge data in with zoneGroup
          zoneGroups[index] = {
            ...group,
            ...transportInfo,
            ...renderingInfo,
            queue,
          };
        }));

        // Sort all the members of each zone alphabetically
        zoneGroups.forEach(group => group.members.sort((m1, m2) => m1.name > m2.name));
        // Sort all the zones alphabetically by coordinator
        zoneGroups.sort((group1, group2) => group1.coordinator.name > group2.coordinator.name);

        this.zoneGroups = zoneGroups;
        resolve(this.zoneGroups);
      }).catch((error) => {
        reject(error);
      });
    });
  }

  /*
   *************************************************************************************************
   *************************************************************************************************
   * PRIVATE HELPER FUNCTIONS
   *************************************************************************************************
   *************************************************************************************************
   */

  /**
   * Returns a uri that can be used in queueing, playing, etc.
   * @param {String} coordinatorId - id of the group coordinator
   * @param {Object} data An object with either uri, playlistName, artistPath, genrePath
   * @returns {String|null}
   */
  async _getURIFromData(coordinatorId, data) {
    let { uri } = data;
    if (data.artistPath) {
      uri = encodeURI(`x-rincon-playlist:${coordinatorId}#A:ALBUMARTIST/${data.artistPath}`);
    } else if (data.genrePath) {
      uri = encodeURI(`x-rincon-playlist:${coordinatorId}#A:GENRE/${data.genrePath}`);
    } else if (data.playlistName) {
      uri = await this.musicLibrary.getPlaylistURI(data.playlistName);
    } else if (data.sonosPlaylistName) {
      uri = await this.musicLibrary.getSonosPlaylistURI(data.sonosPlaylistName);
    }
    return uri || null;
  }

  /**
   * Returns the zone group that a device belongs to
   * @param {String} deviceId
   * @returns {Object|null} Zone Group found for the given deviceId or null
   */
  _zoneGroupForDeviceId(deviceId) {
    let zoneGroup = this.zoneGroups.find(zg => zg.coordinator.id === deviceId);
    if (!zoneGroup) {
      // eslint-disable-next-line arrow-body-style
      zoneGroup = this.zoneGroups.find((zg) => {
        return zg.members.findIndex(member => member.device.id === deviceId) > -1;
      });
    }
    return zoneGroup || null;
  }

  /**
   * Returns current queue for device or null
   * @param {String} deviceId
   * @returns {Array}
   */
  async _getQueue(deviceId) {
    const zone = this.devices.find(device => device.id === deviceId);
    if (!zone) { return null; }
    const queue = await zone.getQueue();
    if (queue && queue.items) {
      queue.items.forEach((track, index) => { queue.items[index].queuePosition = index + 1; });
      return queue.items;
    }
    return null;
  }

  /**
   * Returns Volume and Mute levels for device
   * @param {String} deviceId
   * @returns {Object} { volume, mute }
   */
  async _getRenderingControlInfo(deviceId) {
    const zone = this.devices.find(device => device.id === deviceId);
    if (!zone) { return {}; }
    const volume = await zone.renderingControlService().GetVolume();
    const mute = await zone.renderingControlService().GetMute();
    return {
      volume,
      mute,
    };
  }

  /**
   * Returns group rendering control data based on its members' values
   * @param {String} group The zoneGroup to query
   * @returns {Object}
   */
  static _getGroupRenderingControlInfo(group) {
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
  }

  /**
   * Returns AVTransportInfo
   * @param {String} deviceId
   * @returns {Object} AVTransportInfo
   */
  async _getAVTransportInfo(deviceId) {
    const zone = this.devices.find(device => device.id === deviceId);
    if (!zone) { return {}; }
    /**
     * PlayMode - NORMAL, SUFFLE_NOREPEAT, SHUFFLE, REPEAT_ALL, SHUFFLE_REPEAT_ONE, REPEAT_ONE
     * RecQualityMode
     */
    const transportSettings = await zone.avTransportService().GetTransportSettings();
    /**
     * CurrentTransportState - PLAYING, PAUSED_PLAYBACK, TRANSITIONING, STOPPED
     * CurrentTransportStatus - OK, ?
     * CurrentSpeed - 1, ?
     */
    const transportInfo = await zone.avTransportService().GetTransportInfo();

    /**
     * Actions - Set, Stop, Pause, Play, X_DLNA_SeekTime, Next, Previous, X_DLNA_SeekTrackNr
     */
    const transportActions = await zone.avTransportService().GetCurrentTransportActions();

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
    const positionInfo = await zone.avTransportService().GetPositionInfo();

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
    const currentTrack = await zone.avTransportService().CurrentTrack();

    const tvPlaying = positionInfo.TrackURI.match(/^x-sonos-htastream:/) !== null;
    const lineInPlaying = positionInfo.TrackURI.match(/^x-rincon-stream:/) !== null;

    const queue = await this._getQueue(zone.id);

    return {
      track: currentTrack,
      state: transportInfo.CurrentTransportState,
      playMode: transportSettings.PlayMode,
      actions: transportActions.Actions.split(', '),
      tvPlaying,
      lineInPlaying,
      queue,
    };
  }
}

module.exports = SonosNetwork;

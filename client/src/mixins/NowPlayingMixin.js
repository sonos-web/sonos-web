import groupsAPI from '@/services/API/groups';
import PlayState from '@/enums/PlayState';
import PlayMode from '@/enums/PlayMode';
import TransportActions from '@/enums/TransportActions';
import secondsToTimeString from '@/helpers/secondsToTimeString';

export default {
  methods: {
    handleQueueButtonClick() {
      if (this.$route.name === 'PlayQueue') {
        const back = this.$store.state.previousRoutePath;
        this.$router.push(back);
      } else {
        this.$router.push({ name: 'PlayQueue' });
      }
    },
    groupSelected(groupId) {
      this.$store.dispatch('setActiveZoneGroup', groupId);
    },
    groupName(groupId) {
      return this.$store.getters.groupName(groupId);
    },
    playOrPause() {
      if (this.playStateIcon === 'pause') {
        this.pause();
      } else {
        this.play();
      }
    },
    play() {
      groupsAPI.play(this.activeZoneGroupId);
      this.$store.dispatch('updateZoneGroup', { groupId: this.activeZoneGroupId, update: { state: PlayState.playing } });
    },
    pause() {
      groupsAPI.pause(this.activeZoneGroupId);
      this.$store.dispatch('updateZoneGroup', { groupId: this.activeZoneGroupId, update: { state: PlayState.paused } });
    },
    next() {
      groupsAPI.next(this.activeZoneGroupId);
    },
    previous() {
      groupsAPI.previous(this.activeZoneGroupId);
    },
    toggleMute() {
      if (this.activeZoneGroup) {
        const mute = !this.activeZoneGroup.mute;
        this.$store.commit('UPDATE_ZONE_GROUP', { groupId: this.activeZoneGroupId, update: { mute } });
        groupsAPI.mute(this.activeZoneGroupId, mute);
      }
    },
    toggleShuffle() {
      if (this.activeZoneGroup) {
        let playMode = null;
        const currentPlayMode = this.activeZoneGroup.playMode;
        // Shuffle is on, we want to turn it off
        if (this.shuffleActive) {
          if (this.repeatActive) {
            if (currentPlayMode === PlayMode.shuffleRepeat) {
              playMode = PlayMode.repeat;
            } else {
              playMode = PlayMode.repeatOne;
            }
          } else {
            // Repeat is NOT active & we are turning shuffle off
            playMode = PlayMode.normal;
          }
          // Shuffle is off, we want to turn it on
        } else if (this.repeatActive) {
          if (currentPlayMode === PlayMode.repeat) {
            playMode = PlayMode.shuffleRepeat;
          } else {
            playMode = PlayMode.shuffleRepeatOne;
          }
        } else {
          // Repeat is NOT active & we are turning shuffle on
          playMode = PlayMode.shuffle;
        }
        this.$store.commit('UPDATE_ZONE_GROUP', { groupId: this.activeZoneGroupId, update: { playMode } });
        groupsAPI.playMode(this.activeZoneGroupId, playMode);
      }
    },
    toggleRepeat() {
      if (this.activeZoneGroup) {
        let playMode = null;
        const currentPlayMode = this.activeZoneGroup.playMode;
        // Repeat is on, we want to turn it off or advance to repeat one
        if (this.repeatActive) {
          if (this.shuffleActive) {
            // toggle to shuffle repeat one or turn off repeat to shuffle only
            if (currentPlayMode === PlayMode.shuffleRepeat) {
              playMode = PlayMode.shuffleRepeatOne;
            } else {
              playMode = PlayMode.shuffle;
            }
            // toggle to repeat one or or turn off repeat
          } else if (currentPlayMode === PlayMode.repeat) {
            playMode = PlayMode.repeatOne;
          } else {
            // Shuffle is NOT active & we are turning repeat off
            playMode = PlayMode.normal;
          }
          // Repeat is off, we want to turn it on
        } else if (this.shuffleActive) {
          playMode = PlayMode.shuffleRepeat;
        } else {
          // Shuffle is NOT active & we are turning repeat on
          playMode = PlayMode.repeat;
        }
        this.$store.commit('UPDATE_ZONE_GROUP', { groupId: this.activeZoneGroupId, update: { playMode } });
        groupsAPI.playMode(this.activeZoneGroupId, playMode);
      }
    },
  },
  computed: {
    zoneGroups() {
      return this.$store.state.zoneGroups;
    },
    activeZoneGroupId() {
      return this.$store.state.activeZoneGroupId;
    },
    activeZoneGroup() {
      return this.$store.getters.activeZoneGroup;
    },
    activeZoneGroupMembers() {
      if (this.activeZoneGroup) {
        // For the volume bar, we want the coordinator and its members
        return [this.activeZoneGroup.coordinator, ...this.activeZoneGroup.members];
      }
      return [];
    },
    hasMembers() {
      if (this.activeZoneGroup) {
        return this.activeZoneGroup.members.length > 0;
      }
      return false;
    },
    track() {
      return this.$store.getters.trackTitleForGroup(this.activeZoneGroupId);
    },
    artist() {
      if (this.activeZoneGroup && this.activeZoneGroup.track) {
        return this.activeZoneGroup.track.artist;
      }
      return '';
    },
    album() {
      if (this.activeZoneGroup && this.activeZoneGroup.track) {
        return this.activeZoneGroup.track.album;
      }
      return '';
    },
    encodedArtist() {
      return this.$Base64.encodeURI(this.artist);
    },
    encodedAlbum() {
      return this.$Base64.encodeURI(this.album);
    },
    albumArtURL() {
      return this.$store.getters.albumArtURLForGroup(this.activeZoneGroupId);
    },
    volume: {
      get() {
        if (this.activeZoneGroup) {
          return this.activeZoneGroup.volume;
        }
        return 0;
      },
      set(volume) {
        console.log('volume set', volume);
        if (this.activeZoneGroup) {
          this.$store.commit('UPDATE_ZONE_GROUP', { groupId: this.activeZoneGroupId, update: { volume } });
          groupsAPI.volume(this.activeZoneGroupId, volume);
        }
      },
    },
    trackElapsedTime() {
      if (this.activeZoneGroup && this.activeZoneGroup.track
        && this.activeZoneGroup.track.duration > 0) {
        return secondsToTimeString(this.activeZoneGroup.track.position);
      }
      return '';
    },
    trackDuration() {
      if (this.activeZoneGroup && this.activeZoneGroup.track
        && this.activeZoneGroup.track.duration > 0) {
        return secondsToTimeString(this.activeZoneGroup.track.duration);
      }
      return '';
    },
    trackPosition: {
      get() {
        if (this.activeZoneGroup && this.activeZoneGroup.track) {
          // eslint-disable-next-line max-len
          return ((this.activeZoneGroup.track.position / this.activeZoneGroup.track.duration) * 100) || 0;
        }
        return 0;
      },
      set(position) {
        console.log('trackPosition set', position);
        if (this.activeZoneGroup && this.canSeek) {
          const positionPercentage = position * 0.01;
          const newPosition = Math.round(this.activeZoneGroup.track.duration * positionPercentage);
          const track = { ...this.activeZoneGroup.track, position: newPosition };
          this.$store.commit('UPDATE_ZONE_GROUP', { groupId: this.activeZoneGroupId, update: { track } });
          groupsAPI.seek(this.activeZoneGroupId, newPosition);
        }
      },
    },
    canSeek() {
      if (this.activeZoneGroup) {
        return this.activeZoneGroup.actions.some(action => action === TransportActions.seek);
      }
      return false;
    },
    mute() {
      if (this.activeZoneGroup) {
        return this.activeZoneGroup.mute;
      }
      return false;
    },
    volumeIcon() {
      if (this.mute) return 'volume_mute';
      if (this.activeZoneGroup) {
        return this.activeZoneGroup.volume > 50 ? 'volume_up' : 'volume_down';
      }
      return 'volume_down';
    },
    previousEnabled() {
      if (this.activeZoneGroup) {
        if (this.activeZoneGroup.actions.some(action => action === TransportActions.previous)) {
          return true;
        }
        return false;
      }
      return false;
    },
    nextEnabled() {
      if (this.activeZoneGroup) {
        if (this.activeZoneGroup.actions.some(action => action === TransportActions.next)) {
          return true;
        }
        return false;
      }
      return false;
    },
    playStateEnabled() {
      if (this.activeZoneGroup) {
        if (this.activeZoneGroup.actions.some(action => action === TransportActions.play)) {
          return true;
        }
        return false;
      }
      return false;
    },
    playStateIcon() {
      if (this.activeZoneGroup) {
        switch (this.activeZoneGroup.state) {
          case PlayState.playing:
          case PlayState.transitioning:
            return 'pause';
          default:
            return 'play_arrow';
        }
      }
      return 'play_arrow';
    },
    repeatIcon() {
      if (this.activeZoneGroup) {
        switch (this.activeZoneGroup.playMode) {
          case PlayMode.shuffleRepeat:
          case PlayMode.repeat:
            return 'repeat';
          case PlayMode.shuffleRepeatOne:
          case PlayMode.repeatOne:
            return 'repeat_one';
          default:
            return 'repeat';
        }
      }
      return 'repeat';
    },
    repeatActive() {
      if (this.activeZoneGroup) {
        switch (this.activeZoneGroup.playMode) {
          case PlayMode.shuffleRepeat:
          case PlayMode.repeat:
          case PlayMode.shuffleRepeatOne:
          case PlayMode.repeatOne:
            return true;
          default:
            return false;
        }
      }
      return false;
    },
    shuffleActive() {
      if (this.activeZoneGroup) {
        switch (this.activeZoneGroup.playMode) {
          case PlayMode.shuffle:
          case PlayMode.shuffleRepeat:
          case PlayMode.shuffleRepeatOne:
            return true;
          default:
            return false;
        }
      }
      return false;
    },
  },
};

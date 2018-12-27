<template>
  <v-toolbar fixed clipped-left flat color="secondary" class="now-playing-bar">
    <v-container fill-height fluid pa-0>
      <v-layout align-center>
        <div class="now-playing-bar-left">
          <v-card flat tile>
            <v-list two-line>
              <v-list-tile avatar>
                <v-list-tile-avatar tile size="60px">
                  <v-img class="album-art-image" :src="albumArtURL"></v-img>
                </v-list-tile-avatar>
                <v-list-tile-content class="pl-3">
                  <v-list-tile-title @mouseover="tooltipOnOverFlow">{{ track }}</v-list-tile-title>
                  <v-list-tile-sub-title @mouseover="tooltipOnOverFlow">
                    {{ artist || album }}
                  </v-list-tile-sub-title>
                </v-list-tile-content>
              </v-list-tile>
             </v-list>
          </v-card>
        </div>
        <div class="now-playing-bar-center">
          <v-card flat tile>
            <v-list dense class="pa-0 pt-2">
              <v-list-tile>
                <v-list-tile-action>
                  <v-btn class="play-mode-button" :class="shuffleActive ? 'active' : ''" icon
                  :disabled="!canSeek" @click="toggleShuffle">
                    <v-icon small>shuffle</v-icon>
                  </v-btn>
                </v-list-tile-action>
                <v-list-tile-action>
                  <v-btn :disabled="!previousEnabled" icon @click="previous">
                    <v-icon>skip_previous</v-icon>
                  </v-btn>
                </v-list-tile-action>
                <v-list-tile-action>
                  <v-btn :disabled="!playStateEnabled" icon @click="playOrPause">
                    <v-icon large>{{ playStateIcon }}</v-icon>
                  </v-btn>
                </v-list-tile-action>
                <v-list-tile-action>
                  <v-btn :disabled="!nextEnabled" icon @click="next">
                    <v-icon>skip_next</v-icon>
                  </v-btn>
                </v-list-tile-action>
                <v-list-tile-action>
                  <v-btn class="play-mode-button" :class="repeatActive ? 'active' : ''"
                  :disabled="!canSeek" icon @click="toggleRepeat">
                    <v-icon small>{{ repeatIcon }}</v-icon>
                  </v-btn>
                </v-list-tile-action>
              </v-list-tile>
            </v-list>
            <v-list dense class="pa-0 progress-bar">
              <v-list-tile>
                <v-slider hide-details color="#b3b3b3" step="0" track-color="dark-grey"
                  v-model="trackPosition" :readonly="!canSeek">
                  <div class="caption grey--text text--lighten-1 progress-time" slot="prepend">
                    {{ trackElapsedTime }}
                  </div>
                  <div class="caption grey--text text--lighten-1 progress-time" slot="append">
                    {{ trackDuration }}
                  </div>
                </v-slider>
              </v-list-tile>
            </v-list>
          </v-card>
        </div>
        <div class="now-playing-bar-right">
          <v-card flat tile>
            <v-list dense class="pa-0 volume-bar">
              <v-list-tile>
                <v-btn @click="handleQueueButtonClick" class="queue-button" title="Queue" flat
                :class="$route.name === 'PlayQueue' ? 'v-btn--active': ''">
                  <v-icon>queue_music</v-icon>
                </v-btn>
                <v-menu class="room-select-button" bottom offset-y top>
                  <v-btn title="Select Room" flat slot="activator">
                    <v-icon small>speaker_group</v-icon>
                  </v-btn>
                  <v-list class="room-select-list">
                    <v-list-tile v-for="zoneGroup in zoneGroups" :key="zoneGroup.id"
                    @click="groupSelected(zoneGroup.id)"
                    class="room-select-title"
                    :class="activeZoneGroupId === zoneGroup.id ? 'active' : ''">
                      <v-list-tile-title>{{ groupName(zoneGroup.id) }}</v-list-tile-title>
                    </v-list-tile>
                  </v-list>
                </v-menu>
                <v-menu offset-y top :open-on-click="hasMembers" :close-on-content-click="false">
                  <v-slider slot="activator" hide-details color="#b3b3b3" track-color="dark-grey"
                  :prepend-icon="volumeIcon" @click:prepend="toggleMute" v-model="volume">
                  </v-slider>

                  <v-card color="secondary pa-2">
                    <member-volume-bar v-for="member in activeZoneGroupMembers" :key="member.id"
                      :zoneMember="member">
                    </member-volume-bar>
                  </v-card>
                </v-menu>
              </v-list-tile>
            </v-list>
          </v-card>
        </div>
      </v-layout>
    </v-container>
  </v-toolbar>
</template>

<script>
import MemberVolumeBar from '@/components/MemberVolumeBar.vue';
import groupsAPI from '@/services/API/groups';
import PlayState from '@/enums/PlayState';
import PlayMode from '@/enums/PlayMode';
import TransportActions from '@/enums/TransportActions';
import secondsToTimeString from '@/helpers/secondsToTimeString';

export default {
  name: 'NowPlayingBar',
  components: { MemberVolumeBar },
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
    tooltipOnOverFlow(event) {
      const element = event.target;
      if (element.offsetWidth < element.scrollWidth) {
        element.title = element.textContent.trim();
      } else {
        element.title = '';
      }
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
      if (this.activeZoneGroup) {
        return this.activeZoneGroup.track.artist;
      }
      return '';
    },
    album() {
      if (this.activeZoneGroup) {
        return this.activeZoneGroup.track.album;
      }
      return '';
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
        if (this.activeZoneGroup) {
          this.$store.commit('UPDATE_ZONE_GROUP', { groupId: this.activeZoneGroupId, update: { volume } });
          groupsAPI.volume(this.activeZoneGroupId, volume);
        }
      },
    },
    trackElapsedTime() {
      if (this.activeZoneGroup && this.activeZoneGroup.track.duration > 0) {
        return secondsToTimeString(this.activeZoneGroup.track.position);
      }
      return '';
    },
    trackDuration() {
      if (this.activeZoneGroup && this.activeZoneGroup.track.duration > 0) {
        return secondsToTimeString(this.activeZoneGroup.track.duration);
      }
      return '';
    },
    trackPosition: {
      get() {
        if (this.activeZoneGroup) {
          // eslint-disable-next-line max-len
          return ((this.activeZoneGroup.track.position / this.activeZoneGroup.track.duration) * 100) || 0;
        }
        return 0;
      },
      set(position) {
        if (this.activeZoneGroup) {
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
      return this.volume > 50 ? 'volume_up' : 'volume_down';
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
</script>

<style>
.v-toolbar--fixed.now-playing-bar {
  top: auto;
  bottom: 0;
  height: 90px;
  min-width: 620px;
}
.now-playing-bar .v-list, .now-playing-bar .v-card {
  background: rgba(0,0,0,0)!important;
}
.now-playing-bar .v-toolbar__content {
  height: 100%!important;
  padding: 0 8px!important;
}
.now-playing-bar .v-list__tile__title {
  font-weight: 500;
}
.now-playing-bar .v-list__tile {
  -webkit-box-pack: center;
  -ms-flex-pack: center;
  justify-content: center;
}
.now-playing-bar-right .v-list__tile {
  padding: 0px;
  padding-right: 8px;
}
.now-playing-bar-right .v-input__prepend-outer {
  margin-right: 4px;
}
.now-playing-bar-left {
  width: 30%;
  min-width: 180px;
}
.now-playing-bar-center {
  width: 40%;
  max-width: 722px;
}
.now-playing-bar-right {
  width: 30%;
  min-width: 180px;
  display: flex;
  justify-content: flex-end;
}
.now-playing-bar .progress-time {
  line-height: 24px;
  font-weight: 600;
}
.now-playing-bar .progress-bar {
  margin-top:-4px;
}
.now-playing-bar .volume-bar, .volume-control {
  width: 180px;
}
/***** Slider controls ******/
.v-slider__thumb {
  transform: translateY(-50%) scale(0.35);
  background-color:#b3b3b3!important;
  left: -8px;
}
.v-slider__thumb-container:before {
  left: -12px;
}
.v-slider--is-active .v-slider__track-fill {
  background-color:#3898d6!important;
}
.v-slider--is-active .v-slider__thumb {
  transform: translateY(-50%) scale(0.45)!important;
}
.v-input--is-readonly .v-slider__thumb {
  display: none;
}

.play-mode-button.active, .queue-button.v-btn--active {
  color: #3898d6;
}
.play-mode-button.active:after, .queue-button.v-btn--active:after {
  position: absolute;
  bottom: 0;
  left: 50%;
  display: block;
  width: 4px;
  height: 4px;
  content: "";
  border-radius: 50%;
  background-color: #3898d6;
  -webkit-transform: translateX(-50%);
  transform: translateX(-50%);
}

.now-playing-bar .room-select-button {
  width: 24px;
  margin-right: 4px;
}

.now-playing-bar .room-select-button .v-btn {
  min-width: 24px;
  padding: 0px;
  margin: 0px;
}

.now-playing-bar .queue-button {
  min-width: 24px;
  padding: 0px;
  margin: 0px;
  margin-right: 8px;
}

.now-playing-bar .queue-button.v-btn--active:before {
  background-color:initial;
}

.room-select-list {
  padding: 0px;
}
.room-select-title {
  color: #bababa;
  background: rgba(0,0,0,0.2)!important;
}
.room-select-title.active {
  background: rgba(0,0,0,0.0)!important;
  color: #3898d6;
}
</style>

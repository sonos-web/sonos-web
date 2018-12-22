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
                <v-menu offset-y top :open-on-click="hasMembers" :close-on-content-click="false" :close-delay="4000">                  
                  <v-slider slot="activator" hide-details color="#b3b3b3" track-color="dark-grey"
                  :prepend-icon="volumeIcon" @click:prepend="toggleMute" v-model="volume">                  
                  </v-slider>

                  <v-card color="secondary pa-2">
                    <member-volume-bar v-for="member in activeZoneGroupMembers" :key="member.id" :zoneMember="member"></member-volume-bar>
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
import TransportActions from '@/enums/TransportActions';
import secondsToTimeString from '@/helpers/secondsToTimeString';

export default {
  name: 'NowPlayingBar',
  components: { MemberVolumeBar },
  methods: {
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
  },
  computed: {
    zoneGroups() {
      return this.$store.state.zoneGroups;
    },
    inactiveZoneGroups() {
      return this.zoneGroups.filter(zoneGroup => zoneGroup.id !== this.activeZoneGroupId);
    },
    activeZoneGroupId() {
      return this.$store.state.activeZoneGroupId;
    },
    activeZoneGroup() {
      return this.$store.getters.activeZoneGroup;
    },
    activeZoneGroupName() {
      return this.$store.getters.groupName(this.activeZoneGroupId);
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
        return this.activeZoneGroup.members.length > 0
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
  transform: translateY(-50%) scale(0.45);
}
.v-input--is-readonly .v-slider__thumb {
  display: none;
}
</style>

<template>
  <v-app-bar
    fixed
    clipped-left
    text
    color="secondary"
    class="now-playing-bar"
    height="90">
    <v-container fill-height fluid pa-0>
      <v-layout align-center justify-space-between>
        <div class="now-playing-bar-left">
          <v-card text tile>
            <v-list two-line>
              <v-list-item>
                <v-list-item-avatar tile size="60px" class="d-none d-sm-none d-md-block">
                  <div class="v-responsive v-image">
                    <div v-lazy:background-image="albumArtURL"
                    class="background-image" :key="albumArtURL"></div>
                  </div>
                </v-list-item-avatar>
                <v-list-item-content>
                  <router-link
                    @mouseover="tooltipOnOverFlow"
                    :to="`/album/${encodedAlbum}`"
                    class="item-link title text-truncate pa-0">
                    {{ track }}
                  </router-link>
                  <router-link
                    v-if="artist"
                    @mouseover="tooltipOnOverFlow"
                    :to="`/artist/${encodedArtist}`"
                    class="item-link subtitle-1 text-truncate pa-0">
                    {{ artist }}
                  </router-link>
                  <router-link
                    v-if="album"
                    @mouseover="tooltipOnOverFlow"
                    :to="`/artist/${encodedArtist}`"
                    class="item-link subtitle-1 text-truncate pa-0">
                    {{ album }}
                  </router-link>
                </v-list-item-content>
              </v-list-item>
             </v-list>
          </v-card>
        </div>
        <div class="now-playing-bar-center">
          <v-card text tile>
            <v-list dense class="pa-0 pt-2">
              <v-list-item>
                <v-list-item-action>
                  <v-btn class="play-mode-button" :class="shuffleActive ? 'active' : ''" icon
                  :disabled="!canSeek" @click="toggleShuffle">
                    <v-icon small>shuffle</v-icon>
                  </v-btn>
                </v-list-item-action>
                <v-list-item-action>
                  <v-btn :disabled="!previousEnabled" icon @click="previous">
                    <v-icon>skip_previous</v-icon>
                  </v-btn>
                </v-list-item-action>
                <v-list-item-action>
                  <v-btn :disabled="!playStateEnabled" icon @click="playOrPause">
                    <v-icon large>{{ playStateIcon }}</v-icon>
                  </v-btn>
                </v-list-item-action>
                <v-list-item-action>
                  <v-btn :disabled="!nextEnabled" icon @click="next">
                    <v-icon>skip_next</v-icon>
                  </v-btn>
                </v-list-item-action>
                <v-list-item-action>
                  <v-btn class="play-mode-button" :class="repeatActive ? 'active' : ''"
                  :disabled="!canSeek" icon @click="toggleRepeat">
                    <v-icon small>{{ repeatIcon }}</v-icon>
                  </v-btn>
                </v-list-item-action>
              </v-list-item>
            </v-list>
            <v-list dense class="pa-0 progress-bar">
              <v-list-item>
                <v-slider
                  hide-details
                  color="#b3b3b3"
                  step="0"
                  track-color="dark-grey"
                  v-model="trackPosition"
                  :readonly="!canSeek">
                  <div class="caption grey--text text--lighten-1 progress-time" slot="prepend">
                    {{ trackElapsedTime }}
                  </div>
                  <div class="caption grey--text text--lighten-1 progress-time" slot="append">
                    {{ trackDuration }}
                  </div>
                </v-slider>
              </v-list-item>
            </v-list>
          </v-card>
        </div>
        <div class="now-playing-bar-right">
          <v-card text tile>
            <v-list dense class="pa-0 volume-bar">
              <v-list-item>
                <v-btn @click="handleQueueButtonClick" class="queue-button" title="Queue" text
                :class="$route.name === 'PlayQueue' ? 'v-btn--active': ''">
                  <v-icon>queue_music</v-icon>
                </v-btn>
                <v-menu class="room-select-button" bottom offset-y top>
                  <template v-slot:activator="{ on }">
                    <v-btn :title="groupName(activeZoneGroupId)" text v-on="on">
                      <v-icon small>speaker_group</v-icon>
                    </v-btn>
                  </template>
                  <v-list class="room-select-list">
                    <v-list-item v-for="zoneGroup in zoneGroups" :key="zoneGroup.id"
                    @click="groupSelected(zoneGroup.id)"
                    class="room-select-title"
                    :class="activeZoneGroupId === zoneGroup.id ? 'active' : ''">
                      <v-list-item-title>{{ groupName(zoneGroup.id) }}</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
                <v-menu offset-y top :open-on-click="hasMembers" :close-on-content-click="false">
                  <template v-slot:activator="{ on }">
                    <v-slider
                      thumb-label
                      v-on="on"
                      hide-details
                      color="#b3b3b3"
                      track-color="dark-grey"
                      :prepend-icon="volumeIcon"
                      @click:prepend="toggleMute"
                      v-model="volume">
                    </v-slider>
                  </template>

                  <v-card color="secondary pa-2">
                    <member-volume-bar v-for="member in activeZoneGroupMembers" :key="member.id"
                      :zoneMember="member">
                    </member-volume-bar>
                  </v-card>
                </v-menu>
              </v-list-item>
            </v-list>
          </v-card>
        </div>
      </v-layout>
    </v-container>
  </v-app-bar>
</template>

<script>


import MemberVolumeBar from '@/components/MemberVolumeBar.vue';
import NowPlayingMixin from '@/mixins/NowPlayingMixin';
import tooltipOnOverflow from '@/mixins/tooltipOnOverflow';

export default {
  name: 'NowPlayingBar',
  components: { MemberVolumeBar },
  mixins: [tooltipOnOverflow, NowPlayingMixin],
};
</script>

<style>
.now-playing-bar .v-list-item__action {
  margin: 0px;
}
.now-playing-bar .container.container--fluid {
  max-width: 100%;
}
.v-app-bar--fixed.now-playing-bar {
  top: auto;
  bottom: 0;
  height: 90px;
  min-width: 620px;
}
.now-playing-bar .v-list, .now-playing-bar .v-card {
  background: rgba(0,0,0,0)!important;
  box-shadow: none;
}
.now-playing-bar .v-toolbar__content {
  height: 100%!important;
  padding: 0 8px!important;
}
.now-playing-bar .v-list-item__title {
  font-weight: 500;
}
.now-playing-bar .v-list-item {
  -webkit-box-pack: center;
  -ms-flex-pack: center;
  justify-content: center;
}
.now-playing-bar-right .v-list-item {
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
@media (max-width: 960px) {
  .v-app-bar--fixed.now-playing-bar {
    padding-top: 90px;
    height: 150px !important;
    min-width: auto;
  }

  .now-playing-bar-left {
    width: 40%;
  }

  .now-playing-bar-center {
    display: block;
    position: absolute;
    max-width: none !important;
    bottom: 60px;
    width: calc(100% - 12px);
  }

  .now-playing-bar-right {
    width: 60% !important;
  }
}
@media (max-width: 800px) and (orientation: landscape) {
  .now-playing-bar {
    display: none
  }
}
.now-playing-bar-right .v-btn {
  padding: 0px!important;
  min-width: 24px!important;
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
  transform: translateY(-50%) scale(0.7);
  background-color:#b3b3b3!important;
  left: -2px;
}
.v-slider__thumb-container:before {
  left: -12px;
}
.v-slider__thumb:before {
  display:none!important;
}
.v-slider__thumb-label {
  background-color: #4c4c4c!important;
  left: 4px;
}
.v-slider--active .v-slider__track-fill {
  background-color:#3898d6!important;
}
.v-slider--active .v-slider__thumb {
  transform: translateY(-50%) scale(0.8)!important;
}
.v-input--is-readonly .v-slider__thumb {
  display: none;
}
.v-input > *{
  user-select: none;
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

.now-playing-bar-left .item-link.title {
  font-size: 16px!important;
  opacity: 1.0;
  line-height: 18px;
}
.now-playing-bar-left .item-link.subtitle-1 {
  font-size: 13px!important;
  font-weight: 500!important;
  line-height: 19px;
}

.now-playing-bar-left .v-list-item__content {
  padding: 0px;
}
</style>

<template>
  <v-toolbar fixed clipped-left flat color="secondary" class="now-playing-bar">
    <v-container fill-height fluid pa-0>
      <v-layout align-center>               
        <div class="now-playing-bar-left">
          <v-card flat tile>
            <v-list two-line>
              <v-list-tile avatar>
                <v-list-tile-avatar tile size="60px">
                  <v-img :src="albumArtURL"></v-img>
                </v-list-tile-avatar>
                <v-list-tile-content class="pl-3">
                  <v-list-tile-title>{{ track }}</v-list-tile-title>
                  <v-list-tile-sub-title>{{ artist }}</v-list-tile-sub-title>
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
                  <v-btn icon>
                    <v-icon>skip_previous</v-icon>
                  </v-btn>
                </v-list-tile-action>
                <v-list-tile-action>
                  <v-btn icon>
                    <v-icon large>play_arrow</v-icon>
                  </v-btn>
                </v-list-tile-action>
                <v-list-tile-action>
                  <v-btn icon>
                    <v-icon>skip_next</v-icon>
                  </v-btn>
                </v-list-tile-action>
              </v-list-tile>
            </v-list>
            <v-list dense class="pa-0 progress-bar">
              <v-list-tile>
                <v-slider hide-details color="#b3b3b3" track-color="dark-grey" :value="10">
                  <div class="caption grey--text text--lighten-1  progress-time" slot="prepend">0:00</div>
                  <div class="caption grey--text text--lighten-1  progress-time" slot="append">4:23</div>
                </v-slider>
              </v-list-tile>
            </v-list>
          </v-card>
        </div>
        <div class="now-playing-bar-right">
          <v-card flat tile>
            <v-list dense class="pa-0 volume-bar">
              <v-list-tile>
                <v-slider hide-details color="#b3b3b3" track-color="dark-grey" prepend-icon="volume_down" :value="10">                                    
                </v-slider>
              </v-list-tile>
            </v-list>
          </v-card>
        </div>
      </v-layout>
    </v-container>
  </v-toolbar>
</template>

<script>
export default {
  name: 'NowPlayingBar',
  methods: {
    groupSelected(groupId) {
      this.$store.dispatch('setActiveZoneGroup', groupId);
    },
    groupName(groupId) {
      return this.$store.getters.groupName(groupId);
    },
    tooltipOnOverFlow(event) {
      const element = event;
      if (element.offsetWidth < element.scrollWidth) {
        element.title = element.textContent;
      } else {
        element.title = '';
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
.now-playing-bar .v-slider__thumb {
  transform: translateY(-50%) scale(0.35);
  background-color:#b3b3b3!important;
  left: -8px;
}
.now-playing-bar .v-slider--is-active .v-slider__track-fill {
  background-color:#3898d6!important;
}
.now-playing-bar .v-slider--is-active .v-slider__thumb {
  transform: translateY(-50%) scale(0.45);  
}
.now-playing-bar .v-input--is-readonly .v-slider__thumb {
  display: none;
}
.now-playing-bar .v-input--is-label-active .v-slider__thumb {
  left: -12px;
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
.now-playing-bar .volume-bar {
  width: 180px;
}
</style>
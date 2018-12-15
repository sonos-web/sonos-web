<template>
  <LoadingView v-if="isLoading"></LoadingView>
  <v-container fill-height fluid grid-list-xl v-else>
    <v-layout wrap row>
      <v-flex d-flex v-bind="breakpoint" v-for="(group, index) in zoneGroups" :key="group.id" @click="groupSelected(index)">
        <v-card class="px-3" hover :raised="isActiveGroup(group.coordinator.id)" color="tertiary">
          <div v-show="!isActiveGroup(group.coordinator.id)" class="overlay"></div>
          <v-layout>
            <v-flex xs12 pa-0 pt-0>
              <v-card-title primary-title class="pb-1 align-center">
                <div @mouseover="tooltipOnOverFlow" class="flex xs10 pa-0 display-1 text-truncate">
                  {{ groupName(group.id) }}
                </div>
                <v-spacer></v-spacer>
                <v-icon>{{ statusIcon(group.state)}}</v-icon>
                <v-icon v-if="isPlaying(group.state)">{{ muteIcon(group.mute)}}</v-icon>
              </v-card-title>              
            </v-flex>
          </v-layout>
          <v-layout v-if="group.members.length > 0">
            <v-flex xs12 pt-0>
              <!--eslint-disable-next-line max-len -->
              <v-chip label color="grey darken-3" close class="pa-0 pr-2" v-for="member in group.members" :key="member.id" @input="ungroupZone(member.id)">
                <div class="subheading grey--text text--lighten-2" >
                  {{member.name}}
                </div>
              </v-chip>
            </v-flex>
          </v-layout>
          <v-divider v-if="group.members.length > 0"></v-divider>
          <v-layout mb-3 v-bind="albumSectionBreakpoint">
            <div class="pt-3 pl-3 pr-0">
              <v-img
                :src="group.track.albumArtURL || defaultAlbumArtURL(group.tvPlaying)"
                height="125px"
                width="125px"
                contain
              ></v-img>
            </div>
            <v-flex pl-0 v-bind="albumInfoBreakpoint">
              <v-card-title primary-title class="d-block">                
                <div @mouseover="tooltipOnOverFlow" class="headline text-truncate">{{ trackTitle(group) }}</div>
                <div @mouseover="tooltipOnOverFlow" class="text-truncate">{{ group.track.artist }}</div>
                <div @mouseover="tooltipOnOverFlow" class="text-truncate grey--text">{{ group.track.album }}</div>                
              </v-card-title>
            </v-flex>
          </v-layout>          
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>

import zonesAPI from '@/services/API/zones'

export default {
  name: 'Rooms',
  methods: {
    groupSelected(index) {
      const group = this.zoneGroups[index];
      this.$store.dispatch('setActiveZone', group);
    }, 
    groupName(groupId) {
      return this.$store.getters.groupName(groupId);
    },
    isActiveGroup(groupId) {
      return this.$store.state.activeZoneId === groupId;
    },
    statusIcon(playState) {
      switch (playState) {
        case 'PAUSED_PLAYBACK':
          return 'pause';
          break;
        case 'PLAYING':
          return 'play_arrow';
          break;
        case 'STOPPED':
          return 'stop'
        default:
          return ''
      }
    },
    muteIcon(mute) {
      return mute ? 'volume_off' : 'volume_up';
    },
    trackTitle(group) {
      if (group.tvPlaying) {
        return 'TV'
      } else {
        return group.track.title || '[No music selected]'
      }      
    },
    isPlaying(playState) {
      return playState === 'PLAYING' ? true : false;
    },
    defaultAlbumArtURL(tvPlaying) {
      if (tvPlaying) {
        return this.$store.state.tvAlbumArtURL;
      } else {
        return this.$store.state.defaultAlbumArtURL;
      }
    },
    ungroupZone(zoneId) {
      zonesAPI.ungroupZone(zoneId);
    },
    tooltipOnOverFlow(event) {
      console.log(event.target.offsetWidth)
      console.log(event.target.scrollWidth)
      if (event.target.offsetWidth < event.target.scrollWidth) {
        event.target.title = event.target.textContent
      } else {
        event.target.title = ""
      }
    }
  },
  computed: {
    zoneGroups() {
      return this.$store.state.zoneGroups;
    },
    isLoading() {
      return this.$store.state.isLoading;
    },
    breakpoint() {
      const breakpoint = {}
      if (this.$vuetify.breakpoint.smAndDown) breakpoint.xs12 = true
      if (this.$vuetify.breakpoint.lgAndDown) breakpoint.xs6 = true
      if (this.$vuetify.breakpoint.xl) breakpoint.xs4 = true
      return breakpoint
    },
    albumInfoBreakpoint() {
      const breakpoint = {}
      if (this.$vuetify.breakpoint.smAndUp) breakpoint.xs8 = true
      if (this.$vuetify.breakpoint.xs) breakpoint.xs12 = true
      return breakpoint
    },
    albumSectionBreakpoint() {
       const breakpoint = {}
      if (this.$vuetify.breakpoint.smAndUp){
        breakpoint.column = false;
        breakpoint.wrap = false;
        breakpoint["align-center"] = false;
      } 
      if (this.$vuetify.breakpoint.xs){
        breakpoint.column = true;
        breakpoint.wrap = true;
        breakpoint["align-center"] = true;
      }
      return breakpoint
    }
  },
};
</script>

<style>
.overlay {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  background-color: rgba(0,0,0,0.2);
  z-index: 1;
}
</style>


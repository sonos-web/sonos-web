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
                <div class="display-1 text-truncate">
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
              <v-chip label color="grey darken-3" close class="pa-0 pr-2" v-for="member in group.members" :key="member.id">
                <div class="subheading grey--text text--lighten-2" >
                  {{member.name}}
                </div>
              </v-chip>
            </v-flex>
          </v-layout>
          <v-divider v-if="group.members.length > 0"></v-divider>
          <v-layout mb-3>
            <div class="pt-3 pl-3 pr-0">
              <v-img
                :src="group.track.albumArtURL || defaultAlbumArtURL"
                height="125px"
                width="125px"
                contain
              ></v-img>
            </div>
            <v-flex xs8 pl-0>
              <v-card-title primary-title class="d-block">                
                <div class="headline text-truncate">{{ group.track.title || '[No music selected]'}}</div>
                <div class="text-truncate">{{ group.track.artist }}</div>
                <div class="text-truncate grey--text">{{ group.track.album }}</div>                
              </v-card-title>
            </v-flex>
          </v-layout>          
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  name: 'Rooms',
  methods: {
    groupSelected: function (index) {
      const group = this.zoneGroups[index];
      this.$store.dispatch('setActiveZone', group);
    }, 
    groupName: function(groupId) {
      return this.$store.getters.groupName(groupId);
    },
    isActiveGroup: function(groupId) {
      return this.$store.state.activeZoneId === groupId;
    },
    statusIcon: function(playState) {
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
    muteIcon: function(mute) {
      return mute ? 'volume_off' : 'volume_up';
    },
    isPlaying(playState) {
      return playState === 'PLAYING' ? true : false;
    }
  },
  computed: {
    zoneGroups() {
      return this.$store.state.zoneGroups;
    },
    isLoading() {
      return this.$store.state.isLoading;
    },
    defaultAlbumArtURL() {
      return this.$store.state.defaultAlbumArtURL;
    },
    breakpoint() {
      const breakpoint = {}
      if (this.$vuetify.breakpoint.smAndDown) breakpoint.xs12 = true
      if (this.$vuetify.breakpoint.lgAndDown) breakpoint.xs6 = true
      if (this.$vuetify.breakpoint.xl) breakpoint.xs4 = true
      return breakpoint
    },
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


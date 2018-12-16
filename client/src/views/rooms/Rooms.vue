<template>
  <LoadingView v-if="isLoading"></LoadingView>
  <v-container fill-height fluid grid-list-xl v-else>          
      <v-layout wrap row>      
        <!--eslint-disable-next-line max-len -->           
        <v-flex d-flex v-bind="breakpoint" v-for="(group, index) in zoneGroups" :key="group.id" @click="groupSelected(index)">
          <!--<draggable class="layout wrap row draggable" v-model="zoneGroups" :options="{group: 'zoneGroups', sort: false, draggable:'.zone-group'}">        -->
            <v-card class="px-3 pb-1" hover :raised="isActiveGroup(group.id)" color="tertiary">
              <div v-show="!isActiveGroup(group.id)" class="overlay"></div>
              <v-layout>
                <v-flex xs12 pa-0 pt-0>
                  <v-card-title primary-title class="pb-0 align-center">
                    <div @mouseover="tooltipOnOverFlow" class="flex xs10 pa-0 display-1 text-truncate">
                      {{ groupName(group.id) }}
                    </div>
                    <v-spacer></v-spacer>
                    <v-icon>{{ statusIcon(group.state)}}</v-icon>
                    <v-icon v-if="isPlaying(group.state)">{{ muteIcon(group.mute)}}</v-icon>
                  </v-card-title>
                </v-flex>
              </v-layout>
              <v-layout>              
                <v-flex xs12 pt-0 pb-0>                               
                  <zone-members-draggable :zoneMembers="group.members" @zoneMembersChanged="zoneMembersChanged(group.id, ...arguments)"></zone-members-draggable>
                </v-flex>
              </v-layout>
              <v-divider v-if="group.members.length > 0" class="mt-1"></v-divider>
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
                    <!--eslint-disable-next-line max-len -->
                    <div @mouseover="tooltipOnOverFlow" class="headline text-truncate">{{ trackTitle(group) }}</div>
                    <!--eslint-disable-next-line max-len -->
                    <div @mouseover="tooltipOnOverFlow" class="text-truncate">{{ group.track.artist }}</div>
                    <!--eslint-disable-next-line max-len -->
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
import draggable from 'vuedraggable';
import zonesAPI from '@/services/API/zones';
import ZoneMembersDraggable from '@/views/rooms/ZoneMembersDraggable'

export default {
  name: 'Rooms',
  components: {draggable, ZoneMembersDraggable},
  methods: {
    zoneMembersChanged(groupId, members) {
      const zoneGroup = this.zoneGroups.find(zg => zg.id === groupId);
      // Find the unique member that was just added
      // the members array we receive are all members, new & existing, but we need to find the new one
      // so we compare with the unmodified array in the store first
      const newMember = members.filter(member1 => !zoneGroup.members.some(member2 => member1.id === member2.id))[0]      
      this.$store.commit('UPDATE_ZONE_GROUP', {groupId, update: {members: members}})
      if (newMember) {
        zonesAPI.joinGroup(groupId, newMember.id);
      }      
    },
    groupSelected(index) {
      const group = this.zoneGroups[index];
      this.$store.dispatch('setActiveZoneGroup', group.id);
    },
    groupName(groupId) {
      return this.$store.getters.groupName(groupId);
    },
    isActiveGroup(groupId) {
      return this.$store.state.activeZoneGroupId === groupId;
    },
    statusIcon(playState) {
      switch (playState) {
        case 'PAUSED_PLAYBACK':
          return 'pause';
        case 'PLAYING':
          return 'play_arrow';
        case 'STOPPED':
          return 'stop';
        default:
          return '';
      }
    },
    muteIcon(mute) {
      return mute ? 'volume_off' : 'volume_up';
    },
    trackTitle(group) {
      if (group.tvPlaying) {
        return 'TV';
      }
      return group.track.title || '[No music selected]';
    },
    isPlaying(playState) {
      return playState === 'PLAYING';
    },
    defaultAlbumArtURL(tvPlaying) {
      if (tvPlaying) {
        return this.$store.state.tvAlbumArtURL;
      }
      return this.$store.state.defaultAlbumArtURL;
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
    zoneGroups: {
      get () {
        return this.$store.state.zoneGroups;
      },
      set (newValue) {
        console.log(newValue);
      }      
    },
    isLoading() {
      return this.$store.state.isLoading;
    },
    breakpoint() {
      const breakpoint = {};
      if (this.$vuetify.breakpoint.smAndDown) breakpoint.xs12 = true;
      if (this.$vuetify.breakpoint.lgAndDown) breakpoint.xs6 = true;
      if (this.$vuetify.breakpoint.xl) breakpoint.xs4 = true;
      return breakpoint;
    },
    albumInfoBreakpoint() {
      const breakpoint = {};
      if (this.$vuetify.breakpoint.smAndUp) breakpoint.xs8 = true;
      if (this.$vuetify.breakpoint.xs) breakpoint.xs12 = true;
      return breakpoint;
    },
    albumSectionBreakpoint() {
      const breakpoint = {};
      if (this.$vuetify.breakpoint.smAndUp) {
        breakpoint.column = false;
        breakpoint.wrap = false;
        breakpoint['align-center'] = false;
      }
      if (this.$vuetify.breakpoint.xs) {
        breakpoint.column = true;
        breakpoint.wrap = true;
        breakpoint['align-center'] = true;
      }
      return breakpoint;
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
  pointer-events: none;
}
.zone-group {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
}
.zone-group > * {
  -webkit-box-flex: 1;
  -ms-flex: 1 1 auto;
  flex: 1 1 auto;
}
.draggable {
  min-height:10px;
}
</style>

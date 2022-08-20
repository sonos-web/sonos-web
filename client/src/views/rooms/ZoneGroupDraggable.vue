<template>
  <draggable class="draggableGroup" v-model="zoneGroupAsArray"
    :group="{
        name: 'zoneGroup',
        put: false,
        pull: ['zoneGroupMembers']
      }"
    :sort="false"
    draggable='.zone-group'>
    <v-card class="px-3 pb-1 zone-group" v-for="group in zoneGroupAsArray" :key="group.id"
    hover :raised="isActiveGroup(group.id)" color="tertiary">
      <div v-show="!isActiveGroup(group.id)" class="overlay"></div>
      <v-layout>
        <v-flex xs12 pa-0 pt-0>
          <v-card-title class="pb-0 align-center pt-6">
            <div @mouseover="tooltipOnOverFlow"
              class="flex xs10 pa-0 display-1 text-truncate">
              {{ groupName(group.id) }}
            </div>
            <v-spacer></v-spacer>
            <v-icon v-if="isPlaying(group.state)">{{ muteIcon(group.mute)}}</v-icon>
            <v-icon>{{ statusIcon(group.state)}}</v-icon>
          </v-card-title>
        </v-flex>
      </v-layout>
      <v-layout>
        <v-flex xs12 pt-0 pb-0>
          <zone-members-draggable
          :zoneMembers="group.members"
          @zoneMembersChanged="zoneMembersChanged(group.id, ...arguments)">
          </zone-members-draggable>
        </v-flex>
      </v-layout>
      <v-divider v-if="group.members.length > 0" class="mt-1"></v-divider>
      <v-layout mb-3 v-bind="albumSectionBreakpoint">
        <div class="pt-3 pl-3 pr-0">
          <div class="v-responsive v-image" style="width: 125px; height: 125px;">
            <div v-lazy:background-image="albumArtURL(group.id)"
            class="background-image" :key="albumArtURL(group.id)"></div>
          </div>
        </div>
        <v-flex pl-0 v-bind="albumInfoBreakpoint">
          <v-card-title class="d-block pt-4">
            <div @mouseover="tooltipOnOverFlow" class="headline text-truncate font-weight-medium">
              {{ trackTitle(group.id) }}
            </div>
            <v-layout :class="$style.artistAlbumInfo" ma-0 v-if="group.track">
              <router-link
                @mouseover="tooltipOnOverFlow"
                :to="`/artist/${encodedItem(group.track.artist)}`"
                class="item-link artist text-truncate text-xs-center pa-0">
                {{ group.track.artist }}
              </router-link>
              <span v-if="group.track.artist" class="item-link-separator">•</span>
              <router-link
                v-if="group.track.artist"
                @mouseover="tooltipOnOverFlow"
                :to="`/album/${encodedItem(group.track.album)}`"
                class="item-link album text-truncate text-xs-center pa-0">
                {{ group.track.album }}
              </router-link>
              <router-link
                v-else-if="group.track.album"
                @mouseover="tooltipOnOverFlow"
                class="item-link album text-truncate text-xs-center pa-0">
                {{ group.track.album }}
              </router-link>
            </v-layout>
          </v-card-title>
        </v-flex>
      </v-layout>
    </v-card>
  </draggable>
</template>

<script>
import draggable from 'vuedraggable';
import groupsAPI from '@/services/API/groups';
import ZoneMembersDraggable from '@/views/rooms/ZoneMembersDraggable.vue';
import PlayState from '@/enums/PlayState';
import tooltipOnOverflow from '@/mixins/tooltipOnOverflow';

export default {
  name: 'ZoneGroupDraggable',
  components: { draggable, ZoneMembersDraggable },
  mixins: [tooltipOnOverflow],
  props: {
    zoneGroup: {
      type: Object,
      required: true,
    },
  },
  methods: {
    zoneMembersChanged(groupId, members) {
      const zoneGroup = this.zoneGroups.find(zg => zg.id === groupId);
      const newMembers = members;
      // Find the unique member that was just added
      // the members array we receive are all members, new & existing,
      // but we need to find the new one
      // so we compare with the unmodified array in the store first
      // eslint-disable-next-line max-len
      const newMember = newMembers.filter(member1 => !zoneGroup.members.some(member2 => member1.id === member2.id))[0];

      // this means we dropped a whole group in to the members, so we should
      // add this group and its members to the new members
      if (newMember && newMember.coordinator) {
        const index = newMembers.findIndex(member => member.coordinator === newMember.coordinator);
        // Add coordinator to list of members
        newMembers[index] = newMember.coordinator;
        // Add the whole group, its coordinator, and members to the group we dropped onto
        newMembers.push(...newMember.members);
        // Join coordinator and all its members to new group
        groupsAPI.join(groupId, newMember.coordinator.id);
        newMember.members.map(member => groupsAPI.join(groupId, member.id));

        // Remove this zone group because we have now merged it into another zone group
        this.$store.commit('REMOVE_ZONE_GROUP', newMember.id);
      } else if (newMember) {
        groupsAPI.join(groupId, newMember.id);
      }
      this.$store.commit('UPDATE_ZONE_GROUP', { groupId, update: { members: newMembers } });
    },
    groupName(groupId) {
      return this.$store.getters.groupName(groupId);
    },
    isActiveGroup(groupId) {
      return this.$store.state.activeZoneGroupId === groupId;
    },
    statusIcon(playState) {
      switch (playState) {
        case PlayState.paused:
          return 'pause';
        case PlayState.playing:
        case PlayState.transitioning:
          return 'play_arrow';
        case PlayState.stopped:
          return 'stop';
        default:
          return 'play_arrow';
      }
    },
    muteIcon(mute) {
      if (mute) return 'volume_mute';
      return this.zoneGroup.volume > 50 ? 'volume_up' : 'volume_down';
    },
    albumArtURL(groupId) {
      return this.$store.getters.albumArtURLForGroup(groupId);
    },
    trackTitle(groupId) {
      return this.$store.getters.trackTitleForGroup(groupId);
    },
    isPlaying(playState) {
      return playState === PlayState.playing || playState === PlayState.transitioning;
    },
    encodedItem(item) {
      return this.$Base64.encodeURI(item);
    },
  },
  computed: {
    zoneGroups: {
      get() {
        return this.$store.state.zoneGroups;
      },
    },
    zoneGroupAsArray: {
      get() {
        return [this.zoneGroup];
      },
      set() {

      },
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
.draggableGroup {
  width: 100%;
}
.draggableGroup  > *{
  user-select: none;
}

.draggable {
  min-height:10px;
}
</style>

<style module>
.artistAlbumInfo {
  line-height: 20px;
}
</style>

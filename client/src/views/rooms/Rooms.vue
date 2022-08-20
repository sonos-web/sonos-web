<template>
  <v-container fluid pa-0 ma-0>
    <vue-headful title="Rooms - Sonos Web"></vue-headful>
    <v-container pa-0 pl-2 ma-0 fluid grid-list-xl>
      <div class="text-xs-center">
        <v-snackbar
        top
        absolute
        :timeout="settings.notifications.dragAndDropRooms.timeout"
        v-model="showDragAndDropInfo">
          {{ settings.notifications.dragAndDropRooms.text }}
          <v-btn color="primary" text @click="disableDragAndDropNotification">
            Got It
          </v-btn>
        </v-snackbar>
      </div>
      <v-layout wrap>
        <v-flex xs12>
          <v-btn
            :class="$style.partyModeButton"
            :disabled="zoneGroups.length === 0"
            rounded
            color="secondary"
            @click="partyMode">
            {{ partyModeText }}
          </v-btn>
        </v-flex>
        <v-flex d-flex v-bind="breakpoint"
          v-for="group in zoneGroups" :key="group.id"
          @click="groupSelected(group.id)">
          <zone-group-draggable :zoneGroup="group"></zone-group-draggable>
        </v-flex>
      </v-layout>
    </v-container>
  </v-container>
</template>

<script>
import { mapState } from 'vuex';
import ZoneGroupDraggable from '@/views/rooms/ZoneGroupDraggable.vue';
import groupsAPI from '@/services/API/groups';

export default {
  name: 'Rooms',
  components: { ZoneGroupDraggable },
  data: () => ({
    showDragAndDropInfo: false,
  }),
  created() {
    if (this.settings.notifications.dragAndDropRooms.show) {
      setTimeout(() => {
        this.showDragAndDropInfo = true;
      }, 2000);
    }
  },
  methods: {
    groupSelected(groupId) {
      this.$store.dispatch('setActiveZoneGroup', groupId);
    },
    partyMode() {
      if (this.zoneGroups.length > 1) {
        const groupId = this.activeZoneGroupId;
        groupsAPI.partyMode(groupId);
        // Change zoneGroups immediately to make UI feel more responsive
        const zoneGroupsCopy = JSON.parse(JSON.stringify(this.zoneGroups));
        const joiningZoneGroups = zoneGroupsCopy.filter(zgs => zgs.id !== groupId);
        let newMembers = joiningZoneGroups.map((zg) => {
          zg.members.push(zg.coordinator);
          // remove the merged zone
          this.$store.commit('REMOVE_ZONE_GROUP', zg.id);
          return zg.members;
        });
        // Flatten into a single array
        newMembers = newMembers.concat.apply([], newMembers);
        // Update the active zone with its new members
        this.$store.commit('UPDATE_ZONE_GROUP', { groupId, update: { members: newMembers } });
      } else {
        // TODO: Rewrite function to ungroup quicker
        groupsAPI.ungroupAllZones();
      }
    },
    disableDragAndDropNotification() {
      this.showDragAndDropInfo = false;
      this.$store.commit('UPDATE_SETTINGS', { property: 'notifications.dragAndDropRooms.show', value: false });
    },
  },
  computed: {
    ...mapState(['zoneGroups', 'activeZoneGroupId', 'settings']),
    breakpoint() {
      const breakpoint = {};
      if (this.$vuetify.breakpoint.smAndDown) breakpoint.xs12 = true;
      else if (this.$vuetify.breakpoint.lgAndDown) breakpoint.xs6 = true;
      else if (this.$vuetify.breakpoint.xl) breakpoint.xs4 = true;
      return breakpoint;
    },
    partyModeText() {
      return this.zoneGroups.length > 1 ? 'Enable Party Mode' : 'Disable Party Mode';
    },
  },
};
</script>

<style module>
.partyModeButton {
  letter-spacing: unset;
}
</style>

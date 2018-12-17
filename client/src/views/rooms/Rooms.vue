<template>
  <LoadingView v-if="isLoading"></LoadingView>
  <v-container ma-0 fluid grid-list-xl v-else>    
      <v-layout wrap row>
        <v-flex xs12>
          <v-btn :disabled="zoneGroups.length === 0" round color="secondary" @click="partyMode">{{ partyModeText }}</v-btn>
        </v-flex>  
        <v-flex d-flex v-bind="breakpoint"
          v-for="group in zoneGroups" :key="group.id"
          @click="groupSelected(group.id)">
          <zone-group-draggable :zoneGroup="group"></zone-group-draggable>
        </v-flex>
      </v-layout>
  </v-container>
</template>

<script>
import ZoneGroupDraggable from '@/views/rooms/ZoneGroupDraggable.vue';
import zonesAPI from '@/services/API/zones';
export default {
  name: 'Rooms',
  components: { ZoneGroupDraggable },
  methods: {
    groupSelected(groupId) {      
      this.$store.dispatch('setActiveZoneGroup', groupId);
    },
    partyMode() {
      if (this.zoneGroups.length > 1) {
        const groupId = this.activeZoneGroupId;
        zonesAPI.partyMode(groupId);
        // Change zoneGroups immediately to make UI feel more responsive
        const zoneGroupsCopy = JSON.parse(JSON.stringify(this.zoneGroups));        
        const joiningZoneGroups = zoneGroupsCopy.filter(zgs => zgs.id !== groupId)
        let newMembers = joiningZoneGroups.map(zg => {
          zg.members.push(zg.coordinator)
          // remove the merged zone
          this.$store.commit('REMOVE_ZONE_GROUP', zg.id);
          console.log(zg);
          return zg.members
        });
        // Flatten into a single array
        newMembers = newMembers.concat.apply([], newMembers)
        console.log(newMembers);
        // Update the active zone with its new members
        this.$store.commit('UPDATE_ZONE_GROUP', { groupId, update: { members: newMembers } });
      } else {
        // TODO: Rewrite function to ungroup quicker
        zonesAPI.ungroupAllZones();
      }
    }
  },
  computed: {
    zoneGroups() {
      return this.$store.state.zoneGroups;
    },
    activeZoneGroupId() {
      return this.$store.state.activeZoneGroupId
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
    partyModeText() {
      return this.zoneGroups.length > 1 ? 'Enable Party Mode': 'Disable Party Mode';
    },
  },
};
</script>

<template>
  <LoadingView v-if="isLoading"></LoadingView>
  <v-container fill-height fluid grid-list-xl v-else>    
      <v-layout wrap row>
        <v-flex xs12>
          <v-btn :disabled="zoneGroups.length === 0" round color="secondary" @click="partyMode">{{ partyModeText }}</v-btn>
        </v-flex>  
        <v-flex d-flex v-bind="breakpoint"
          v-for="(group, index) in zoneGroups" :key="group.id"
          @click="groupSelected(index)">
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
    groupSelected(index) {
      const group = this.zoneGroups[index];
      this.$store.dispatch('setActiveZoneGroup', group.id);
    },
    partyMode() {
      zonesAPI.partyMode(this.$store.state.activeZoneGroupId);
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

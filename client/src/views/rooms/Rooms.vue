<template>
  <LoadingView v-if="isLoading"></LoadingView>
  <v-container fill-height fluid grid-list-xl v-else>
      <v-layout wrap row>
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

export default {
  name: 'Rooms',
  components: { ZoneGroupDraggable },
  methods: {
    groupSelected(index) {
      const group = this.zoneGroups[index];
      this.$store.dispatch('setActiveZoneGroup', group.id);
    },
  },
  computed: {
    zoneGroups: {
      get() {
        return this.$store.state.zoneGroups;
      },
      set(newValue) {
        return;
      },
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
  },
};
</script>

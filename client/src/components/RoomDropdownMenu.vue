<template>
  <v-menu bottom offset-y>
    <v-btn class="zone-group-selector" :class="buttonClasses" large flat slot="activator">
      {{ activeZoneGroupName }}
      <v-icon right v-if="!hideIcon">arrow_drop_down</v-icon>
    </v-btn>
    <v-list>
      <v-list-tile v-for="zoneGroup in inactiveZoneGroups" :key="zoneGroup.id"
      @click="groupSelected(zoneGroup.id)">
        <v-list-tile-title>{{ groupName(zoneGroup.id) }}</v-list-tile-title>
      </v-list-tile>
    </v-list>
  </v-menu>
</template>


<script>
export default {
  name: 'RoomDropdownMenu',
  props: {
    hideIcon: {
      type: Boolean,
      default: false,
    },
    buttonClasses: {
      type: String,
      default: '',
    },
  },
  methods: {
    groupSelected(groupId) {
      this.$store.dispatch('setActiveZoneGroup', groupId);
    },
    groupName(groupId) {
      return this.$store.getters.groupName(groupId);
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
      return this.groupName(this.activeZoneGroupId);
    },
  },
};
</script>

<template>
  <v-menu bottom offset-y>
    <template v-slot:activator="{ on }">
      <v-btn
        class="zone-group-selector"
        :class="buttonClasses"
        :large="buttonLarge"
        text
        v-on="on">
        {{ activeZoneGroupName }}
        <v-icon right v-if="!hideIcon">arrow_drop_down</v-icon>
      </v-btn>
    </template>
    <v-list>
      <v-list-item
        v-for="zoneGroup in inactiveZoneGroups"
        :key="zoneGroup.id"
        @click="groupSelected(zoneGroup.id)">
        <v-list-item-title>{{ groupName(zoneGroup.id) }}</v-list-item-title>
      </v-list-item>
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
    buttonLarge: {
      type: Boolean,
      default: false,
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

<style>
.zone-group-selector {
  font-size: 24px!important;
  text-transform: none;
  letter-spacing: unset;
}
</style>

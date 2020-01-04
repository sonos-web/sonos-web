<template>
  <draggable class="draggable"
    v-model="zoneMembersCopy"
    :group="{
      name: 'zoneGroupMembers',
      put: ['zoneGroup', 'zoneGroupMembers'],
      pull: ['zoneGroupMembers']
    }"
    :sort="false"
    draggable=".member-zone">
    <zone-member-chip v-for="member in zoneMembersCopy" :key="member.id"
      :zoneMember="member">
    </zone-member-chip>
  </draggable>
</template>

<script>
import draggable from 'vuedraggable';
import ZoneMemberChip from '@/views/rooms/ZoneMemberChip.vue';

export default {
  name: 'ZoneMembersDraggable',
  components: { draggable, ZoneMemberChip },
  props: {
    zoneMembers: {
      type: Array,
      required: true,
    },
  },
  computed: {
    zoneMembersCopy: {
      get() {
        return this.zoneMembers;
      },
      set(members) {
        this.$emit('zoneMembersChanged', members);
      },
    },
  },
};
</script>

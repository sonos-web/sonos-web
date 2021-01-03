<template>
  <v-chip
    close
    label
    color="grey darken-3"
    :class="$style.chip"
    class="member-zone"
    @click:close="ungroupZone(zoneMember.id)">
    <div class="subtitle-1
 grey--text text--lighten-2" >
      {{zoneMember.name}}
    </div>
  </v-chip>
</template>


<script>
import zonesAPI from '@/services/API/zones';

export default {
  name: 'ZoneMemberChip',
  props: {
    zoneMember: {
      type: Object,
      required: true,
    },
  },
  methods: {
    ungroupZone(zoneId) {
      zonesAPI.ungroupZone(zoneId);
    },
  },
};
</script>

<style module>
.chip {
  margin-top: 5px;
}
</style>

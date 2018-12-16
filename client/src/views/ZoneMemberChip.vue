<template>
  <v-chip label color="grey darken-3" close class="member-zone pa-0 pr-2"  @input="ungroupZone(zoneMember.id)">
    <div class="subheading grey--text text--lighten-2" >
      {{zoneMember.name}}
    </div>
  </v-chip>
</template>


<script>
export default {
  name: 'ZoneMemberChip',
  props: {
    zoneMember: {
      type: Object,
      required: true,      
    },
  },
}
</script>
<template>  
  <LoadingView v-if="isLoading"></LoadingView>
  <v-container fill-height fluid grid-list-xl v-else>
    <v-layout row wrap>
      <v-flex xs4 v-for="group in zoneGroups" :key="group.id">
        <v-card class="px-4" hover color="tertiary">
          <v-layout>
            <v-flex xs12>
              <v-card-title primary-title class="pa-0 pt-3">
                <div class="display-1 text-truncate">
                  {{group.coordinator_name}}
                </div>
              </v-card-title>
            </v-flex>
          </v-layout>
          <v-layout>
            <v-flex xs12 v-if="memberZones.length > 1">
              <v-chip label color="grey darken-3" close class="pa-0 pr-2" v-for="zone in memberZones" :key="zone.id">
                <div class="subheading grey--text text--lighten-2" >
                  {{zone.name}}
                </div>
              </v-chip>
            </v-flex>
          </v-layout>
          <v-divider v-if="memberZones.length > 1"></v-divider>
          <v-layout>
            <v-flex xs5>
              <v-img
                src="https://cdn.vuetifyjs.com/images/cards/foster.jpg"
                height="125px"
                contain
              ></v-img>
            </v-flex>
            <v-flex xs7>
              <v-card-title primary-title>
                <div>
                  <div class="headline">Supermodel</div>
                  <div>Foster the People</div>
                  <div>(2014)</div>
                </div>
              </v-card-title>
            </v-flex>
          </v-layout>
          <v-divider></v-divider>
          <v-card-actions class="pa-3">
            Rate this album
            <v-spacer></v-spacer>
            <v-icon>star_border</v-icon>
            <v-icon>star_border</v-icon>
            <v-icon>star_border</v-icon>
            <v-icon>star_border</v-icon>
            <v-icon>star_border</v-icon>
          </v-card-actions>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  name: 'Rooms',
  created() {
    this.$store.dispatch('fetchZones');
  },
  computed: {
    zoneGroups() {      
      return this.$store.state.zoneGroups;
    },
    memberZones() {
      return this.$store.getters.memberZones;
    },
    isLoading() {      
      return this.$store.state.isLoading;
    }
  },
};
</script>

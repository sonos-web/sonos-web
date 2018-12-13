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
                  {{group.coordinator.name}}
                </div>
              </v-card-title>
            </v-flex>
          </v-layout>
          <v-layout v-if="group.members.length > 0">
            <v-flex xs12 class="pt-0">
              <!--eslint-disable-next-line max-len -->
              <v-chip label color="grey darken-3" close class="pa-0 pr-2" v-for="member in group.members" :key="member.id">
                <div class="subheading grey--text text--lighten-2" >
                  {{member.name}}
                </div>
              </v-chip>
            </v-flex>
          </v-layout>
          <v-divider v-if="group.members.length > 0"></v-divider>
          <v-layout>
            <v-flex xs5>
              <v-img
                :src="group.track.albumArtURL"
                height="125px"
                contain
              ></v-img>
            </v-flex>
            <v-flex xs7>
              <v-card-title primary-title>                
                <div class="headline text-truncate">{{ group.track.title }}</div>
                <div class="text-truncate">{{ group.track.artist }}</div>
                <div class="text-truncate">{{ group.track.album }}</div>                
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
  computed: {
    zoneGroups() {
      return this.$store.state.zoneGroups;
    },
    isLoading() {
      return this.$store.state.isLoading;
    },
  },
};
</script>

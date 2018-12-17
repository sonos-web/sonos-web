<template>
  <LoadingView v-if="isLoading"></LoadingView>
  <v-container fill-height fluid v-else>
    <v-layout align-center justify-center row wrap>
      <v-flex xs12 align-center justify-center>
        <v-img class="album-art" :src="albumArtURL(activeZoneGroup.id)"></v-img>
      </v-flex>
      <v-flex xs12>
        <div class="text-xs-center">
          <v-card-title primary-title class="d-block">
            <div @mouseover="tooltipOnOverFlow" class="display-1 text-truncate">
              {{ trackTitle(activeZoneGroup.id) }}
            </div>
            <div @mouseover="tooltipOnOverFlow" class="headline text-truncate">
              {{ activeZoneGroup.track.artist }}
            </div>
            <div @mouseover="tooltipOnOverFlow" class="headline text-truncate grey--text">
              {{ activeZoneGroup.track.album }}
            </div>
          </v-card-title>
        </div>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  name: 'NowPlaying',
  methods: {
     albumArtURL(groupId) {
      return this.$store.getters.albumArtURLForGroup(groupId);
    },
    trackTitle(groupId) {
      return this.$store.getters.trackTitleForGroup(groupId)      
    },
    tooltipOnOverFlow(event) {
      const element = event;
      if (element.offsetWidth < element.scrollWidth) {
        element.title = element.textContent;
      } else {
        element.title = '';
      }
    },
  },
  computed: {
    isLoading() {
      return this.$store.state.isLoading;
    },
    zoneGroups() {
      return this.$store.state.zoneGroups;
    },
    activeZoneGroup() {      
      return this.$store.getters.activeZoneGroup;
    },   
  },
};
</script>

<style>
.album-art {
  max-width: 500px;
  margin: 0 auto;
}
</style>

<template>
  <v-container fluid fill-height pa-0>
    <vue-headful :title="documentTitle"></vue-headful>
    <LoadingView v-if="isLoading"></LoadingView>
    <v-container fill-height fluid v-else>
      <v-layout align-center justify-center row wrap>
        <v-flex xs12 align-center justify-center>
          <div class="text-xs-center pb-3">
            <room-dropdown-menu></room-dropdown-menu>
          </div>
          <v-img class="album-art album-art-image" :src="albumArtURL"></v-img>
          <v-flex xs12>
            <div class="text-xs-center">
              <v-card-title primary-title class="d-block">
                <div @mouseover="tooltipOnOverFlow" class="headline text-truncate">
                  {{ track }}
                </div>
                <div @mouseover="tooltipOnOverFlow" class="text-truncate">
                  {{ artist }}
                </div>
                <div @mouseover="tooltipOnOverFlow" class="text-truncate grey--text">
                  {{ album }}
                </div>
              </v-card-title>
            </div>
          </v-flex>
        </v-flex>
      </v-layout>
    </v-container>
  </v-container>
</template>

<script>
import RoomDropdownMenu from '@/components/RoomDropdownMenu.vue';

export default {
  name: 'NowPlaying',
  components: { RoomDropdownMenu },
  methods: {
    tooltipOnOverFlow(event) {
      const element = event.target;
      if (element.offsetWidth < element.scrollWidth) {
        element.title = element.textContent.trim();
      } else {
        element.title = '';
      }
    },
  },
  computed: {
    documentTitle() {
      // const title = this.$store.state.documentTitleForActiveGroup;
      return 'Now Playing - Sonos Web';
    },
    isLoading() {
      return this.$store.state.isLoading;
    },
    activeZoneGroupId() {
      return this.$store.state.activeZoneGroupId;
    },
    activeZoneGroup() {
      return this.$store.getters.activeZoneGroup;
    },
    track() {
      return this.$store.getters.trackTitleForGroup(this.activeZoneGroupId);
    },
    artist() {
      if (this.activeZoneGroup) {
        return this.activeZoneGroup.track.artist;
      }
      return '';
    },
    album() {
      if (this.activeZoneGroup) {
        return this.activeZoneGroup.track.album;
      }
      return '';
    },
    albumArtURL() {
      return this.$store.getters.albumArtURLForGroup(this.activeZoneGroupId);
    },
  },
};
</script>

<style>
.album-art {
  width: calc(100vh - 400px);
  max-width: 500px;
  min-width: 150px;
  margin: 0 auto;
}
.zone-group-selector {
  font-size: 24px;
  text-transform: none;
}
</style>

<template>
  <v-container fluid fill-height pa-0>
    <vue-headful :title="documentTitle"></vue-headful>
    <v-container fill-height fluid class="now-playing">
      <v-layout align-center justify-center row wrap>
        <v-flex xs12 align-center justify-center>
          <div class="text-xs-center pb-3">
            <room-dropdown-menu></room-dropdown-menu>
          </div>
          <div class="v-responsive v-image">
            <div v-lazy:background-image="albumArtURL"
              class="album-art background-image" :key="albumArtURL"></div>
          </div>
          <v-flex xs12>
            <div class="text-xs-center">
              <v-card-title primary-title class="d-block">
                <div @mouseover="tooltipOnOverFlow"
                  class="headline text-truncate font-weight-medium">
                  {{ track }}
                </div>
                <v-layout justify-center>
                  <router-link
                    @mouseover="tooltipOnOverFlow"
                    :to="`/artist/${encodedArtist}`"
                    class="item-link artist text-truncate text-xs-center pa-0">
                    {{ artist }}
                  </router-link>
                  <span v-if="artist" class="item-link-separator">•</span>
                  <router-link
                    v-if="artist"
                    @mouseover="tooltipOnOverFlow"
                    :to="`/album/${encodedAlbum}`"
                    class="item-link album text-truncate text-xs-center pa-0">
                    {{ album }}
                  </router-link>
                  <router-link
                    v-else-if="album"
                    @mouseover="tooltipOnOverFlow"
                    class="item-link album text-truncate text-xs-center pa-0">
                    {{ album }}
                  </router-link>
                </v-layout>
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
import tooltipOnOverflow from '@/mixins/tooltipOnOverflow';

export default {
  name: 'NowPlaying',
  mixins: [tooltipOnOverflow],
  components: { RoomDropdownMenu },
  computed: {
    documentTitle() {
      // const title = this.$store.state.documentTitleForActiveGroup;
      return 'Now Playing - Sonos Web';
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
    encodedArtist() {
      return this.$Base64.encodeURI(this.artist);
    },
    encodedAlbum() {
      return this.$Base64.encodeURI(this.album);
    },
  },
};
</script>

<style>
.album-art {
  width: calc(100vh - 400px);
  height: calc(100vh - 400px);
  max-width: 500px;
  max-height: 500px;
  min-width: 150px;
  margin: 0 auto;
  position: relative;
}
.zone-group-selector {
  font-size: 24px;
  text-transform: none;
}
</style>

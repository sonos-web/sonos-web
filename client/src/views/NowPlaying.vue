<template>
  <v-container fluid fill-height pa-0>
    <vue-headful :title="documentTitle"></vue-headful>
    <LoadingView v-if="isLoading"></LoadingView>
    <v-container fill-height fluid v-else>
      <v-layout align-center justify-center row wrap>
        <v-flex xs12 align-center justify-center>
          <div class="text-xs-center pb-3">
            <v-menu bottom offset-y>
              <v-btn class="zone-group-selector" large flat slot="activator">{{ activeZoneGroupName }}
                <v-icon right>arrow_drop_down</v-icon>
              </v-btn>
              <v-list>
                <v-list-tile v-for="zoneGroup in inactiveZoneGroups" :key="zoneGroup.id"
                @click="groupSelected(zoneGroup.id)">
                  <v-list-tile-title>{{ groupName(zoneGroup.id) }}</v-list-tile-title>
                </v-list-tile>
              </v-list>
            </v-menu>
          </div>
          <v-img class="album-art" contain :src="albumArtURL(activeZoneGroupId)"></v-img>
          <v-flex xs12>
            <div class="text-xs-center">
              <v-card-title primary-title class="d-block">
                <div @mouseover="tooltipOnOverFlow" class="headline text-truncate">
                  {{ trackTitle(activeZoneGroupId) }}
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
export default {
  name: 'NowPlaying',
  methods: {
    groupSelected(groupId) {
      this.$store.dispatch('setActiveZoneGroup', groupId);
    },
    groupName(groupId) {
      return this.$store.getters.groupName(groupId);
    },
    albumArtURL(groupId) {
      return this.$store.getters.albumArtURLForGroup(groupId);
    },
    trackTitle(groupId) {
      return this.$store.getters.trackTitleForGroup(groupId);
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
    documentTitle() {
      const title = this.$store.state.documentTitleForActiveGroup;
      return  title || 'Now Playing - Sonos Web';
    },
    isLoading() {
      return this.$store.state.isLoading;
    },
    zoneGroups() {
      return this.$store.state.zoneGroups;
    },
    activeZoneGroupId() {
      return this.$store.state.activeZoneGroupId;
    },
    activeZoneGroup() {
      return this.$store.getters.activeZoneGroup;
    },
    activeZoneGroupName() {
      return this.$store.getters.groupName(this.activeZoneGroupId);
    },
    inactiveZoneGroups() {
      return this.zoneGroups.filter(zoneGroup => zoneGroup.id !== this.activeZoneGroupId);
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
  font-size:24px;
  text-transform: none;
}
</style>

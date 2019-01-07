<template>
  <v-container fluid pa-0 ma-0>
    <vue-headful title="Music Library - Sonos Web"></vue-headful>
    <v-layout row wrap :style="style">
      <v-tabs class="library-tabs pb-3"
      centered show-arrows
      slider-color="rgba(0,0,0,0)">
        <v-tab v-for="(tab, index) in tabs" :to="tab.link" :key="index">
          {{ tab.title }}
        </v-tab>
      </v-tabs>
      <router-view></router-view>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  name: 'MusicLibrary',
  data: () => ({
    albumArtists: {},
    tabs: [
      { title: 'Artists', link: '/library/artists' },
      { title: 'Albums', link: '/library/albums' },
      { title: 'Songs', link: '/library/songs' },
      { title: 'Genres', link: '/library/genres' },
      { title: 'Playlists', link: '/library/playlists' },
      { title: 'Shares', link: '/library/shares' },
    ],
  }),
  computed: {
    style() {
      return {
        maxWidth: '1400px',
        margin: '0 auto',
      };
    },
  },
};
</script>

<style>
.library-tabs {
  width: 100%;
}
.library-tabs .v-tabs__bar.theme--dark {
  background-color: unset;
}
.library-tabs .v-tabs__item {
  font-size: 13px;
  letter-spacing: 0.1em;
}
.library-tabs .v-tabs__div {
  position: relative;
  padding: 0px 8px;
}
.library-tabs .v-tabs__item.v-tabs__item--active:before {
  content: "";
  height: 2px;
  background-color: #3898d6;
  width: 30px;
  position: absolute;
  display: block;
  bottom: 8px;
}
</style>

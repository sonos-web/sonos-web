<template>
  <v-container fluid pa-0 ma-0>
    <vue-headful title="Music Library - Sonos Web"></vue-headful>
    <v-layout wrap>
      <v-tabs
      class="library-tabs pb-3"
      centered
      show-arrows>
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
    tabs: [
      { title: 'Artists', link: '/library/artists' },
      { title: 'Albums', link: '/library/albums' },
      { title: 'Songs', link: '/library/songs' },
      { title: 'Genres', link: '/library/genres' },
      { title: 'Playlists', link: '/library/playlists' },
      { title: 'Shares', link: '/library/share' },
    ],
  }),
};
</script>

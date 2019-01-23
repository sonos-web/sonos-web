<template>
  <v-container fluid pa-0 ma-0>
    <vue-headful title="My Sonos - Sonos Web"></vue-headful>
    <v-layout row wrap>
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
  name: 'MySonos',
  data: () => ({
    tabs: [
      { title: 'Playlists', link: '/sonos/playlists' },
      { title: 'Favorites', link: '/sonos/favorites' },
    ],
  }),
};
</script>

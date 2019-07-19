<template>
  <v-container fluid pa-0 ma-0>
    <vue-headful title="Spotify - Sonos Web"></vue-headful>
      <v-layout v-if="authorized===false" row wrap fill-height align-center justify-center>
        <v-flex xs12>
          <div class="display-1 font-weight-bold text-xs-center pb-1">
            Authorize Spotify
          </div>
          <div class="subheading grey--text font-weight-medium text-xs-center pb-2">
            Play your saved tracks, albums, playlists, etc. from Spotify
          </div>
          <div class="caption grey--text font-weight-medium text-xs-center pb-4">
            * Spotify Premium is required for playback
          </div>
          <div class="text-xs-center">
            <v-btn color="primary" round large @click="authorize">Connect Spotify Account
            </v-btn>
          </div>
        </v-flex>
      </v-layout>
      <v-layout v-else-if="authorized" row wrap>
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
import spotifyAuth from '@/mixins/spotifyAuth';
import SpotifyAPI from '@/services/API/services/spotify';

export default {
  name: 'Spotify',
  mixins: [spotifyAuth],
  data: () => ({
    tabs: [
      { title: 'Playlists', link: '/spotify/playlists' },
      { title: 'Albums', link: '/spotify/albums' },
      { title: 'Songs', link: '/spotify/songs' },
    ],
  }),
  methods: {
    async authorize() {
      const response = await SpotifyAPI.getAuthURL();
      window.location = response.data.authURL;
    },
  },
};
</script>

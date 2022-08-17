<template>
  <v-container fill-height fluid pa-0 ma-0>
    <vue-headful title="Spotify Search - Sonos Web"></vue-headful>
    <v-layout row wrap>
        <v-flex xs12 class="spotify-search-container" :class="stickyClass">
          <input v-focus v-model="searchInput"
          type="text" class="spotify-search-container__input" placeholder="Start typing...">
        </v-flex>
        <v-flex xs12 mt-12>
          <template v-if="searchInput">
            <ErrorView v-if="error" absolute :message="errorMessage"></ErrorView>
            <LoadingView v-else-if="loading" absolute message="Loading..."></LoadingView>
            <v-layout pt-12 row wrap v-else>
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
          </template>
          <v-layout v-else row wrap fill-height align-center justify-center>
            <v-flex xs12>
              <div class="display-1 font-weight-bold text-xs-center pb-3">
                Search Spotify
              </div>
              <div class="subtitle-1
 grey--text font-weight-medium text-xs-center">
                Find artists, albums, songs, and playlists.
              </div>
            </v-flex>
          </v-layout>
        </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  name: 'SpotifySearch',
  data: () => ({
    firstLoad: true,
    searchInput: null,
    loading: false,
    error: false,
    errorMessage: '',
  }),
  created() {
    this.searchInput = this.$route.params.pathMatch || null;
  },
  beforeRouteUpdate(to, from, next) {
    if (to.name === 'SpotifySearch') {
      this.searchInput = null;
    }
    next();
  },
  computed: {
    stickyClass() {
      switch (this.$vuetify.breakpoint.name) {
        case 'md':
          return 'md';
        case 'sm':
        case 'xs':
          return 'sm';
        default:
          return '';
      }
    },
    tabs() {
      return [
        { title: 'Artists', link: `/spotify/search/artists/${this.encodedSearchInput}` },
        { title: 'Albums', link: `/spotify/search/albums/${this.encodedSearchInput}` },
        { title: 'Songs', link: `/spotify/search/songs/${this.encodedSearchInput}` },
        { title: 'Playlists', link: `/spotify/search/playlists/${this.encodedSearchInput}` },
      ];
    },
    encodedSearchInput() {
      return encodeURIComponent(this.searchInput);
    },
  },
  watch: {
    searchInput(value) {
      if (this.firstLoad) {
        this.firstLoad = false;
      } else if (value) {
        this.$router.push(`/spotify/search/artists/${encodeURIComponent(value)}`);
      } else {
        this.$router.push('/spotify/search');
      }
    },
  },
  directives: {
    focus: {
      inserted(el) {
        el.focus();
      },
    },
  },
};
</script>

<style>
.spotify-search-container {
  background-color: #282828;
  top: 0;
  left: 230px;
  width: 100%;
  padding: 16px 32px;
  z-index: 2;
}

.spotify-search-container.md {
  left: 80px;
  width: calc(100% - 80px);
}
.spotify-search-container.sm {
  left: 80px;
  width: calc(100% - 80px);
  padding: 32px 32px 8px 32px;
}
.spotify-search-container__input {
  font-size: 36px;
  line-height: 44px;
  font-weight: 900;
  color: #fff;
  text-transform: none;
  caret-color: #3898d6;
  width: 100%;
}

.spotify-search-container__input:focus, .spotify-search-container__input:hover {
  outline: 0;
}

</style>

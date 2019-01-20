<template>
  <v-container fill-height fluid pa-0 ma-0>
    <vue-headful title="Search - Sonos Web"></vue-headful>
    <v-layout row wrap>
        <v-flex xs12 class="search-container" :class="stickyClass">
          <input v-focus v-model="searchInput"
          type="text" class="search-container__input" placeholder="Start typing...">
        </v-flex>
        <v-flex xs12 mt-5>
          <template v-if="searchInput">
            <ErrorView v-if="error" absolute :message="errorMessage"></ErrorView>
            <LoadingView v-else-if="loading" absolute message="Loading..."></LoadingView>
            <v-layout pt-4 row wrap v-else>
              <v-tabs class="library-tabs pb-3"
              centered show-arrows
              slider-color="rgba(0,0,0,0)">
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
                Search your Music Library
              </div>
              <div class="subheading grey--text font-weight-medium text-xs-center">
                Find artists, albums, songs, genres, playlists, etc.
              </div>
            </v-flex>
          </v-layout>
        </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  name: 'Search',
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
    if (to.name === 'Search') {
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
        { title: 'Top Results', link: `/search/results/${this.encodedSearchInput}` },
        { title: 'Artists', link: `/search/artists/${this.encodedSearchInput}` },
        { title: 'Albums', link: `/search/albums/${this.encodedSearchInput}` },
        { title: 'Songs', link: `/search/songs/${this.encodedSearchInput}` },
        { title: 'Genres', link: `/search/genres/${this.encodedSearchInput}` },
        { title: 'Playlists', link: `/search/playlists/${this.encodedSearchInput}` },
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
        this.$router.push(`/search/results/${encodeURIComponent(value)}`);
      } else {
        this.$router.push('/search');
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
.search-container {
  background-color: #282828;
  position: fixed;
  top: 0;
  left: 230px;
  width: calc(100% - 230px);
  padding: 16px 32px;
  z-index: 2;
}

.search-container.md {
  left: 80px;
  width: calc(100% - 80px);
}
.search-container.sm {
  left: 80px;
  width: calc(100% - 80px);
  padding: 32px 32px 8px 32px;
}
.search-container__input {
  font-size: 36px;
  line-height: 44px;
  font-weight: 900;
  color: #fff;
  text-transform: none;
  caret-color: #3898d6;
  width: 100%;
}

.search-container__input:focus, .search-container__input:hover {
  outline: 0;
}

</style>

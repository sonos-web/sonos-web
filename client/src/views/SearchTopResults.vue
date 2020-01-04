<template>
  <v-layout>
    <ErrorView v-if="error" absolute :message="errorMessage"></ErrorView>
    <LoadingView v-else-if="loading" absolute message="Loading..."></LoadingView>
    <v-layout row wrap v-else>
      <v-flex xs12 v-if="songs" pb-4>
        <v-layout justify-center>
          <router-link
            :to="`/search/songs/${searchTerm}`"
            class="top-result-heading">
            Songs
          </router-link>
        </v-layout>
        <v-flex xs12>
          <song-list :songs="songs"></song-list>
        </v-flex>
      </v-flex>
      <v-flex xs12 v-if="artists" pb-4>
        <v-layout justify-center>
          <router-link
            :to="`/search/artists/${searchTerm}`"
            class="top-result-heading">
            Artists
          </router-link>
        </v-layout>
        <v-layout row wrap pt-2>
          <library-item v-for="item in artists" :key="item.uri"
            :item="item" toPrefix="/artist"></library-item>
        </v-layout>
      </v-flex>
      <v-flex xs12 v-if="albums" pb-4>
        <v-layout justify-center>
          <router-link
            :to="`/search/albums/${searchTerm}`"
            class="top-result-heading">
            Albums
          </router-link>
        </v-layout>
        <v-layout row wrap pt-2>
          <library-item v-for="item in albums" :key="item.uri"
            :item="item" toPrefix="/album"></library-item>
        </v-layout>
      </v-flex>
      <v-flex xs12 v-if="playlists" pb-4>
        <v-layout justify-center>
          <router-link
            :to="`/search/playlists/${searchTerm}`"
            class="top-result-heading">
            Playlists
          </router-link>
        </v-layout>
        <v-layout row wrap pt-2>
          <library-item v-for="item in playlists" :key="item.uri"
            :item="item" toPrefix="/playlist"></library-item>
        </v-layout>
      </v-flex>
      <v-flex xs12 v-if="playlists" pb-4>
        <v-layout justify-center>
          <router-link
            :to="`/search/sp/${searchTerm}`"
            class="top-result-heading">
            Sonos Playlists
          </router-link>
        </v-layout>
        <v-layout row wrap pt-2>
          <library-item v-for="item in sonosPlaylists" :key="item.uri"
            :item="item" toPrefix="/sp"></library-item>
        </v-layout>
      </v-flex>
      <v-flex xs12 v-if="genres" pb-4>
        <v-layout justify-center>
          <router-link
            :to="`/search/genres/${searchTerm}`"
            class="top-result-heading">
            Genres
          </router-link>
        </v-layout>
        <v-layout row wrap pt-2>
          <library-item v-for="item in genres" :key="item.uri"
            :item="item" toPrefix="/genre"></library-item>
        </v-layout>
      </v-flex>
    </v-layout>
  </v-layout>
</template>

<script>
import MusicLibraryAPI from '@/services/API/musicLibrary';
import LibraryItem from '@/components/LibraryItem.vue';
import SongList from '@/components/SongList.vue';

export default {
  name: 'SearchTopResults',
  components: { LibraryItem, SongList },
  data: () => ({
    topResults: {},
    loading: true,
    error: false,
    errorMessage: null,
    searchTerm: null,
  }),
  created() {
    this.searchTerm = this.$route.params.pathMatch;
    this.getTopSearchResults();
  },
  methods: {
    async getTopSearchResults() {
      try {
        this.loading = true;
        this.error = false;

        const result = await MusicLibraryAPI.searchTopResults({ searchTerm: this.searchTerm });
        // Because the user may trigger quite a few different searches by typing
        // make sure we settle on the data that matches the current searchTerm input
        if (result.data.searchTerm === this.searchTerm) {
          this.topResults = result.data;
        }
        this.loading = false;
      } catch (error) {
        this.loading = false;
        this.error = true;
        this.errorMessage = `${error.response.status}: ${error.response.data}`;
      }
    },
  },
  computed: {
    songs() {
      return this.topResults.tracks ? this.topResults.tracks.items : null;
    },
    artists() {
      return this.topResults.albumArtists ? this.topResults.albumArtists.items : null;
    },
    albums() {
      return this.topResults.albums ? this.topResults.albums.items : null;
    },
    playlists() {
      return this.topResults.playlists ? this.topResults.playlists.items : null;
    },
    sonosPlaylists() {
      return this.topResults.sonos_playlists ? this.topResults.sonos_playlists.items : null;
    },
    genres() {
      return this.topResults.genres ? this.topResults.genres.items : null;
    },
  },
  watch: {
    async $route(to) {
      this.searchTerm = to.params.pathMatch;
      this.getTopSearchResults();
    },
  },
};
</script>

<style>
.top-result-heading {
  color: white!important;
  text-decoration: none;
  font-weight: 900;
  font-size: 34px;
  display: block;
}
</style>

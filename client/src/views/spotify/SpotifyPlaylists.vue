<template>
  <v-layout>
    <load-library-on-scroll
      @loading-error="loadingError"
      @loaded-items="loadedItems"
      :asyncLoadMethod="loadMethod"
      :resetItems="resetItems"
      :libraryItem="spotifyPlaylists"
      :searchTerm="searchTerm">
    </load-library-on-scroll>
    <ErrorView v-if="error" absolute :message="errorMessage"></ErrorView>
    <LoadingView v-else-if="loading" absolute message="Loading..."></LoadingView>
    <v-layout row wrap v-else>
      <library-item-count :total="spotifyPlaylists.total"
        label="Playlists"></library-item-count>
      <library-item v-for="item in items" :key="item.uri"
        :item="item" toPrefix="/spotify/playlist" :isSpotify="true"></library-item>
    </v-layout>
  </v-layout>
</template>

<script>
import deepmerge from 'deepmerge';
import SpotifyAPI from '@/services/API/services/spotify';
import LibraryItem from '@/components/LibraryItem.vue';
import LibraryItemCount from '@/components/LibraryItemCount.vue';
import LoadLibraryOnScroll from '@/components/LoadLibraryOnScroll.vue';

export default {
  name: 'SpotifyPlaylists',
  components: { LibraryItem, LibraryItemCount, LoadLibraryOnScroll },
  props: {
    search: {
      type: Boolean,
      default: false,
    },
  },
  data: () => ({
    spotifyPlaylists: {},
    loading: true,
    error: false,
    errorMessage: null,
  }),
  methods: {
    loadedItems(data) {
      this.loading = false;
      this.spotifyPlaylists = deepmerge(this.spotifyPlaylists, data);
    },
    loadingError(error) {
      this.loading = false;
      this.error = true;
      this.errorMessage = `${error.response.status}: ${error.response.data}`;
    },
    resetItems() {
      this.songs = {};
    },
  },
  computed: {
    items() {
      return this.spotifyPlaylists.items || [];
    },
    searchTerm() {
      if (this.search) {
        return this.$route.params.pathMatch;
      }
      return null;
    },
    loadMethod() {
      return this.search ? SpotifyAPI.searchPlaylists : SpotifyAPI.getUserPlaylists;
    },
  },
};
</script>

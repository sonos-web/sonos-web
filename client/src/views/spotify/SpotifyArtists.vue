<template>
  <v-layout>
    <load-library-on-scroll
      @loading-error="loadingError"
      @loaded-items="loadedItems"
      :asyncLoadMethod="loadMethod"
      :resetItems="resetItems"
      :libraryItem="artists"
      :searchTerm="searchTerm">
    </load-library-on-scroll>
    <ErrorView v-if="error" absolute :message="errorMessage"></ErrorView>
    <LoadingView v-else-if="loading" absolute message="Loading..."></LoadingView>
    <v-layout row wrap v-else>
      <library-item-count :total="artists.total" label="Artists"></library-item-count>
      <library-item v-for="(item, index) in items" :key="`${item.uri}#${index}`"
        :item="item" toPrefix="/spotify/artist" :isSpotify="true"></library-item>
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
  name: 'SpotifyArtists',
  components: { LibraryItem, LibraryItemCount, LoadLibraryOnScroll },
  data: () => ({
    artists: {},
    loading: true,
    error: false,
    errorMessage: null,
  }),
  props: {
    search: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    loadedItems(data) {
      this.loading = false;
      this.artists = deepmerge(this.artists, data);
    },
    loadingError(error) {
      this.loading = false;
      this.error = true;
      this.errorMessage = `${error.response.status}: ${error.response.data}`;
    },
    resetItems() {
      this.artists = {};
    },
  },
  computed: {
    items() {
      return this.artists.items || [];
    },
    searchTerm() {
      if (this.search) {
        return this.$route.params.pathMatch;
      }
      return null;
    },
    loadMethod() {
      return SpotifyAPI.searchArtists;
    },
  },
};
</script>

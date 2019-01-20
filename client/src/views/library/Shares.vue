<template>
  <v-layout>
    <load-library-on-scroll
      @loading-error="loadingError"
      @loaded-items="loadedItems"
      :asyncLoadMethod="loadMethod"
      :libraryItem="shares"
      :searchTerm="searchTerm">
    </load-library-on-scroll>
    <ErrorView v-if="error" absolute :message="errorMessage"></ErrorView>
    <LoadingView v-else-if="loading" absolute message="Loading..."></LoadingView>
    <v-layout row wrap v-else>
      <library-item-count :total="shares.total" label="Shares"></library-item-count>
      <library-item v-for="item in items"
      :key="item.uri" :item="item" toPrefix="/share"></library-item>
    </v-layout>
  </v-layout>
</template>

<script>
import deepmerge from 'deepmerge';
import MusicLibraryAPI from '@/services/API/musicLibrary';
import LibraryItem from '@/components/LibraryItem.vue';
import LibraryItemCount from '@/components/LibraryItemCount.vue';
import LoadLibraryOnScroll from '@/components/LoadLibraryOnScroll.vue';

export default {
  name: 'Shares',
  components: { LibraryItem, LibraryItemCount, LoadLibraryOnScroll },
  props: {
    search: {
      type: Boolean,
      default: false,
    },
  },
  data: () => ({
    shares: {},
    loading: true,
    error: false,
    errorMessage: null,
  }),
  methods: {
    loadedItems(data) {
      this.loading = false;
      this.shares = deepmerge(this.shares, data);
    },
    loadingError(error) {
      this.loading = false;
      this.error = true;
      this.errorMessage = `${error.response.status}: ${error.response.data}`;
    },
  },
  computed: {
    items() {
      return this.shares.items || [];
    },
    searchTerm() {
      if (this.search) {
        return this.$route.params.pathMatch;
      }
      return null;
    },
    loadMethod() {
      return this.search ? MusicLibraryAPI.searchShares : MusicLibraryAPI.getShares;
    },
  },
};
</script>

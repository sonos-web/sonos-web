<template>
  <v-layout>
    <load-library-on-scroll
      @loading-error="loadingError"
      @loaded-items="loadedItems"
      :asyncLoadMethod="getShares"
      :libraryItem="shares">
    </load-library-on-scroll>
    <v-layout row wrap v-if="!loading">
      <library-item-count :total="shares.total" label="Shares"></library-item-count>
      <library-item v-for="item in items"
      :key="item.uri" :item="item" toPrefix="/share"></library-item>
    </v-layout>
    <LoadingView v-if="loading" absolute message="Loading..."></LoadingView>
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
  data: () => ({
    shares: {},
    loading: true,
  }),
  methods: {
    getShares: MusicLibraryAPI.getShares,
    loadedItems(data) {
      this.loading = false;
      this.shares = deepmerge(this.shares, data);
    },
    loadingError(error) {
      this.loading = false;
      console.log(error);
    },
  },
  computed: {
    items() {
      return this.shares.items || [];
    },
  },
};
</script>

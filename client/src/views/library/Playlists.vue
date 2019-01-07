<template>
  <v-layout>
    <load-library-on-scroll
      @loading-error="loadingError"
      @loaded-items="loadedItems"
      :asyncLoadMethod="getPlaylists"
      :libraryItem="playlists">
    </load-library-on-scroll>
    <v-layout row wrap v-if="!loading">
      <library-item-count :total="playlists.total" label="Playlists"></library-item-count>
      <library-item v-for="item in items"
      :key="item.uri" :item="item" toPrefix="/playlist"></library-item>
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
  name: 'Playlists',
  components: { LibraryItem, LibraryItemCount, LoadLibraryOnScroll },
  data: () => ({
    playlists: {},
    loading: true,
  }),
  methods: {
    getPlaylists: MusicLibraryAPI.getPlaylists,
    loadedItems(data) {
      this.loading = false;
      this.playlists = deepmerge(this.playlists, data);
    },
    loadingError(error) {
      this.loading = false;
      console.log(error);
    },
  },
  computed: {
    items() {
      return this.playlists.items || [];
    },
  },
};
</script>

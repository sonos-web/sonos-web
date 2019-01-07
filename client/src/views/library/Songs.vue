<template>
  <v-layout>
    <load-library-on-scroll
      @loading-error="loadingError"
      @loaded-items="loadedItems"
      :asyncLoadMethod="getSongs"
      :libraryItem="songs">
    </load-library-on-scroll>
    <v-layout row wrap v-if="!loading">
      <library-item-count :total="songs.total" label="Songs"></library-item-count>
      <v-flex xs12>
        <song-list :songs="items"></song-list>
      </v-flex>
    </v-layout>
    <LoadingView v-if="loading" absolute message="Loading..."></LoadingView>
  </v-layout>
</template>

<script>
import deepmerge from 'deepmerge';
import MusicLibraryAPI from '@/services/API/musicLibrary';
import SongList from '@/components/SongList.vue';
import LibraryItemCount from '@/components/LibraryItemCount.vue';
import LoadLibraryOnScroll from '@/components/LoadLibraryOnScroll.vue';

export default {
  name: 'Songs',
  components: { LibraryItemCount, LoadLibraryOnScroll, SongList },
  data: () => ({
    songs: {},
    loading: true,
  }),
  methods: {
    getSongs: MusicLibraryAPI.getSongs,
    loadedItems(data) {
      this.loading = false;
      this.songs = deepmerge(this.songs, data);
    },
    loadingError(error) {
      this.loading = false;
      console.log(error);
    },
  },
  computed: {
    items() {
      return this.songs.items || [];
    },
  },
};
</script>

<template>
  <v-layout>
    <load-library-on-scroll
      @loading-error="loadingError"
      @loaded-items="loadedItems"
      :asyncLoadMethod="loadMethod"
      :libraryItem="songs"
      :resetItems="resetItems"
      :searchTerm="searchTerm">
    </load-library-on-scroll>
    <ErrorView v-if="error" absolute :message="errorMessage"></ErrorView>
    <LoadingView v-else-if="loading" absolute message="Loading..."></LoadingView>
    <v-layout row wrap v-else>
      <v-flex xs12>
        <song-list :songs="items"></song-list>
      </v-flex>
    </v-layout>
  </v-layout>
</template>

<script>
import deepmerge from 'deepmerge';
import SoundcloudAPI from '@/services/API/services/soundcloud';
import SongList from '@/views/soundcloud/SoundcloudSongList.vue';
import LoadLibraryOnScroll from '@/components/LoadLibraryOnScroll.vue';

export default {
  name: 'SoundcloudStream',
  components: { LoadLibraryOnScroll, SongList },
  props: {
    search: {
      type: Boolean,
      default: false,
    },
  },
  data: () => ({
    songs: {},
    loading: true,
    error: false,
    errorMessage: null,
  }),
  methods: {
    loadedItems(data) {
      this.loading = false;
      this.songs = deepmerge(this.songs, data);
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
      return this.songs.items || [];
    },
    searchTerm() {
      if (this.search) {
        return this.$route.params.pathMatch;
      }
      return null;
    },
    loadMethod() {
      return this.search ? SoundcloudAPI.search : SoundcloudAPI.getStream;
    },
  },
};
</script>

<template>
  <v-flex xs6 sm4 md3 lg2 xl2 pa-2 mb-3 class="library-item">
    <v-card flat tile :to="path">
      <div class="v-responsive v-image" v-if="!albumCollageImages.length">
        <div class="v-responsive__sizer" style="padding-bottom: 100%;"></div>
        <div v-lazy:background-image="albumArtURL"
        class="background-image" :key="albumArtURL"></div>
      </div>
      <album-collage v-else :images="albumCollageImages"></album-collage>
      <div class="library-title text-xs-center font-weight-bold">
        {{ item.title }}
      </div>
    </v-card>
    <router-link
      v-if="item.artist && showSubtitle"
      @mouseover="tooltipOnOverFlow"
      :to="artistLink"
      class="item-link text-truncate text-xs-center pa-0">
      {{ item.artist }}
    </router-link>
  </v-flex>
</template>

<script>
import tooltipOnOverflow from '@/mixins/tooltipOnOverflow';
import AlbumCollage from '@/components/AlbumCollage.vue';

export default {
  name: 'LibraryItem',
  mixins: [tooltipOnOverflow],
  components: { AlbumCollage },
  props: {
    item: {
      type: Object,
      required: true,
    },
    toPrefix: {
      type: String,
      required: true,
    },
    allPrefix: {
      type: String,
      default: null,
    },
    name: {
      type: String,
      default: null,
    },
    showSubtitle: {
      type: Boolean,
      default: true,
    },
    isShare: {
      type: Boolean,
      default: false,
    },
    isSpotify: {
      type: Boolean,
      default: false,
    }
  },
  computed: {
    albumArtURL() {
      return this.albumCollageImages.length ? '' : (this.item.albumArtURI || this.$store.state.defaultAlbumArtURL);
    },
    path() {
      if (this.item.title === 'All') {
        if (this.allPrefix === '/genre/songs') {
          return `/genre/all/${this.$Base64.encodeURI(this.name)}/songs`;
        }
        return `${this.allPrefix}/all/${this.$Base64.encodeURI(this.name)}`;
      } 
      if (this.isShare) {
        return `${this.toPrefix}/${this.$Base64.encodeURI(`${this.name}/${this.item.title}`)}`;
      }
      if (this.isSpotify) {
        return `${this.toPrefix}/${this.item.uri.split(':').slice(-1)[0]}`;
      }
      return `${this.toPrefix}/${this.$Base64.encodeURI(this.item.title)}`;
    },
    encodedArtist() {
      return this.$Base64.encodeURI(this.item.artist);
    },
    artistLink() {
      if (this.isSpotify) {
        return `/spotify/artist/${this.item.artistURI}`;
      }
      return `/artist/${encodedArtist}`;
    },
    albumCollageImages() {
      if (Array.isArray(this.item.albumArtURI)) {
        return this.item.albumArtURI;
      }
      return [];
    },
  },
};
</script>

<style>
.library-item .v-card {
  background-color: rgba(0,0,0,0);
}
.library-item .library-title {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  margin: 12px 0 4px;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  word-break: break-word;
}
</style>

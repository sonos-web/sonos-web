<template>
  <v-list-item
    :ripple="false"
    class="song-item"
    :class="queueItemClasses"
    @dblclick.native="playNowAction"
    @contextmenu.prevent.native="showMenu">
    <v-list-item-avatar tile size="40px">
      <v-icon class="music-note" color="grey" v-if="albumMode">
        music_note
      </v-icon>
      <div class="v-responsive v-image" v-else>
        <div v-lazy:background-image="albumArtURL"
        class="background-image" :key="albumArtURL"></div>
      </div>
    </v-list-item-avatar>

    <v-list-item-content>
      <v-list-item-title
        class="font-weight-bold"
        @mouseover="tooltipOnOverFlow">
        {{ song.title }}
      </v-list-item-title>
      <div v-if="!albumMode || allAlbum">
        <v-layout>
          <router-link
            v-if="!albumMode"
            @mouseover="tooltipOnOverFlow"
            :to="artistLink"
            class="item-link text-truncate text-xs-center pa-0">
            {{ song.artist }}
          </router-link>
          <template v-if="song.album">
            <span v-if="!allAlbum" class="item-link-separator">•</span>
            <router-link
              @mouseover="tooltipOnOverFlow"
              :to="albumLink"
              class="item-link text-truncate text-xs-center pa-0">
              {{ song.album }}
            </router-link>
          </template>
        </v-layout>
      </div>
    </v-list-item-content>
    <v-list-item-action>
      <v-btn icon ripple @click="showMenu">
        <v-icon color="grey lighten-1">more_horiz</v-icon>
      </v-btn>
    </v-list-item-action>
  </v-list-item>
</template>


<script>
import tooltipOnOverflow from '@/mixins/tooltipOnOverflow';
import playQueueActions from '@/mixins/playQueueActions';

export default {
  name: 'QueueItem',
  mixins: [tooltipOnOverflow, playQueueActions],
  props: {
    song: {
      type: Object,
      required: true,
    },
    songNumber: {
      type: Number,
      required: true,
    },
    albumMode: {
      type: Boolean,
      default: false,
    },
    allAlbum: {
      type: Boolean,
      default: false,
    },
    doubleClickURIData: {
      type: Object,
      default: null,
    },
    isSpotify: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    playNowAction() {
      if (this.doubleClickURIData) {
        this.doubleClickURIData.songNumber = this.songNumber;
        this.replaceQueueAndPlay(this.doubleClickURIData);
      } else {
        this.playNow(this.song.uri);
      }
    },
    showMenu(event) {
      this.$emit('show-menu', event, this.song.uri);
    },
  },
  computed: {
    activeZoneGroup() {
      return this.$store.getters.activeZoneGroup;
    },
    albumArtURL() {
      return this.song.albumArtURI || this.$store.state.defaultAlbumArtURL;
    },
    active() {
      if (this.activeZoneGroup && this.activeZoneGroup.track) {
        return this.activeZoneGroup.track.uri === this.song.uri;
      }
      return false;
    },
    queueItemClasses() {
      let classes = '';
      if (this.active) {
        classes += 'active';
      }
      return classes;
    },
    encodedArtist() {
      return this.$Base64.encodeURI(this.song.artist);
    },
    encodedAlbum() {
      return this.$Base64.encodeURI(this.song.album);
    },
    artistLink() {
      if (this.isSpotify) {
        return `/spotify/artist/${this.song.artistURI}`;
      }
      return `/artist/${this.encodedArtist}`;
    },
    albumLink() {
      if (this.isSpotify) {
        return `/spotify/album/${this.song.albumURI}`;
      }
      return `/album/${this.encodedAlbum}`;
    },
  },
};
</script>

<style>
.song-item {
  width: 100%;
  -webkit-transition-property: background-color!important;
  transition-property: background-color!important;
  -webkit-transition-duration: .2s!important;
  transition-duration: .2s!important;
  -webkit-transition-timing-function: linear!important;
  transition-timing-function: linear!important;
}
.song-item:hover .music-note {
  color: white!important;
}
.song-item .v-list-item--link:hover {
  background: unset!important;
}
.song-item:hover {
  background-color: rgba(0,0,0,0.25);
}
.song-item.active {
  background-color: rgba(0,0,0,0.35);
}
.song-item.active .music-note {
  color:#3898d6!important;
}
.song-item .v-list-item__action {
  display: none;
}
.song-item:hover .v-list-item__action,
.song-item.checked .v-list-item__action {
  display: flex;
}
.song-item .item-link {
  font-size: 14px;
}
</style>

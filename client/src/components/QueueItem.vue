<template>
  <v-list-item
    :ripple="false"
    class="queue-item"
    :class="queueItemClasses"
    @dblclick.native="playTrack"
    @contextmenu.prevent.native="showMenu">
    <v-list-item-avatar tile size="40px">
      <div class="v-responsive v-image">
        <div v-lazy:background-image="albumArtURL"
        class="background-image" :key="albumArtURL"></div>
      </div>
    </v-list-item-avatar>
    <v-list-item-content>
      <v-list-item-title class="font-weight-bold"
        @mouseover="tooltipOnOverFlow">
        {{ track.title }}
      </v-list-item-title>
      <div>
        <v-layout>
          <router-link
            @mouseover="tooltipOnOverFlow"
            :to="`/artist/${encodedArtist}`"
            class="item-link text-truncate text-xs-center pa-0">
            {{ track.artist }}
          </router-link>
          <template v-if="track.album">
            <span class="item-link-separator">•</span>
            <router-link
              @mouseover="tooltipOnOverFlow"
              :to="`/album/${encodedAlbum}`"
              class="item-link text-truncate text-xs-center pa-0">
              {{ track.album }}
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
    <!--
    <v-list-item-action>
      <v-checkbox class="queue-item-checkbox"
        v-model="checked" color="white" hide-details>
      </v-checkbox>
    </v-list-item-action>
    -->
  </v-list-item>
</template>


<script>
import groupsAPI from '@/services/API/groups';
import tooltipOnOverflow from '@/mixins/tooltipOnOverflow';

export default {
  name: 'QueueItem',
  mixins: [tooltipOnOverflow],
  props: {
    track: {
      type: Object,
      required: true,
    },
  },
  methods: {
    playTrack() {
      groupsAPI.playTrackFromQueue(this.activeZoneGroup.id, this.track.queuePosition);
    },
    showMenu(event) {
      this.$emit('show-menu', event, this.track.queuePosition);
    },
  },
  computed: {
    activeZoneGroup() {
      return this.$store.getters.activeZoneGroup;
    },
    albumArtURL() {
      return this.track.albumArtURI || this.$store.state.defaultAlbumArtURL;
    },
    active() {
      if (this.activeZoneGroup) {
        return this.activeZoneGroup.track.queuePosition === this.track.queuePosition;
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
      return this.$Base64.encodeURI(this.track.artist);
    },
    encodedAlbum() {
      return this.$Base64.encodeURI(this.track.album);
    },
  },
};
</script>

<style>
.queue-item {
  width: 100%;
  -webkit-transition-property: background-color!important;
  transition-property: background-color!important;
  -webkit-transition-duration: .2s!important;
  transition-duration: .2s!important;
  -webkit-transition-timing-function: linear!important;
  transition-timing-function: linear!important;
}
.queue-item .v-list-item--link:hover {
  background: unset!important;
}
.queue-item.checked {
  background-color: rgba(0,0,0,0.15);
}
.queue-item:hover {
  background-color: rgba(0,0,0,0.25);
}
.queue-item.active {
  background-color: rgba(0,0,0,0.35);
}
.queue-item-checkbox {
  flex: none;
}
.queue-item .v-list-item__action {
  display: none;
}
.queue-item:hover .v-list-item__action,
.queue-item.checked .v-list-item__action {
  display: flex;
}
.queue-item .item-link {
  font-size: 14px;
}
.v-list-item:hover::before,
.v-list-item:focus::before {
  opacity: 0!important;
}
</style>

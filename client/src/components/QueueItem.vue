<template>
  <v-list-tile
    avatar class="queue-item"
    :class="queueItemClasses"
    @dblclick.native="playTrack">
    <v-list-tile-avatar tile>
      <v-img class="album-art-image" :src="albumArtURL"></v-img>
    </v-list-tile-avatar>

    <v-list-tile-content>
      <v-list-tile-title @mouseover="tooltipOnOverFlow">{{ track.title }}</v-list-tile-title>
      <v-list-tile-sub-title
        @mouseover="tooltipOnOverFlow">
        {{ track.artist }} {{ track.album ? ` • ${track.album}` : '' }}
      </v-list-tile-sub-title>
    </v-list-tile-content>
    <v-list-tile-action>
      <v-menu
        offset-y bottom
        v-model="showContextMenu">
        <v-btn slot="activator" icon ripple>
          <v-icon color="grey lighten-1">more_horiz</v-icon>
        </v-btn>
        <v-list color="secondary">
          <v-list-tile @click="playTrack">
            <v-list-tile-title>Play Song</v-list-tile-title>
          </v-list-tile>
          <v-list-tile @click="removeTrack">
            <v-list-tile-title>Remove from Queue</v-list-tile-title>
          </v-list-tile>
        </v-list>
      </v-menu>
    </v-list-tile-action>
    <!--
    <v-list-tile-action>
      <v-checkbox class="queue-item-checkbox"
        v-model="checked" color="white" hide-details>
      </v-checkbox>
    </v-list-tile-action>
    -->
  </v-list-tile>
</template>


<script>
import groupsAPI from '@/services/API/groups';

export default {
  name: 'QueueItem',
  props: {
    track: {
      type: Object,
      required: true,
    },
  },
  data: () => ({
    // checked: false,
    showContextMenu: false,
  }),
  methods: {
    tooltipOnOverFlow(event) {
      const element = event.target;
      if (element.offsetWidth < element.scrollWidth) {
        element.title = element.textContent.trim();
      } else {
        element.title = '';
      }
    },
    removeTrack() {
      this.$emit('remove-track', this.track.queuePosition);
    },
    playTrack() {
      groupsAPI.playTrackFromQueue(this.activeZoneGroup.id, this.track.queuePosition);
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
      if (this.checked) {
        classes += ' checked';
      }
      return classes;
    },
  },
};
</script>

<style>
.queue-item {
  width: 100%;
}
.queue-item.checked {
  background: rgba(0,0,0,0.15);
}
.queue-item:hover {
  background: rgba(0,0,0,0.25);
}
.queue-item.active {
  background: rgba(0,0,0,0.35);
}
.queue-item-checkbox {
  flex: none;
}
.queue-item .v-list__tile__action {
  display: none;
}
.queue-item:hover .v-list__tile__action,
.queue-item.checked .v-list__tile__action {
  display: flex;
}
</style>

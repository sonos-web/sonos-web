<template>
  <v-list class="queue-list" two-line>
     <draggable class="draggable" v-model="itemsCopy"
      :options="{draggable:'.queue-item'}" @sort="onSort">
      <template v-for="(track, index) in itemsCopy">
        <queue-item
        @hide-menu="showMenu = false"
        @show-menu="showTrackMenu"
        :track="track" :key="`${track.uri}#${index}`"></queue-item>
      </template>
    </draggable>
    <v-menu
      max-width="180px"
      offset-y bottom
      offset-x
      v-model="showMenu"
      absolute
      :position-x="menuPosition.x"
      :position-y="menuPosition.y">
      <v-list color="secondary">
        <v-list-tile @click="playTrack">
          <v-list-tile-title>Play Song</v-list-tile-title>
        </v-list-tile>
        <v-list-tile @click="removeTrack">
          <v-list-tile-title>Remove from Queue</v-list-tile-title>
        </v-list-tile>
      </v-list>
    </v-menu>
  </v-list>
</template>


<script>
import QueueItem from '@/components/QueueItem.vue';
import draggable from 'vuedraggable';
import '@/helpers/extensions/Array';
import groupsAPI from '@/services/API/groups';

export default {
  name: 'QueueList',
  components: { QueueItem, draggable },
  props: {
    items: {
      type: Array,
      required: true,
    },
  },
  created() {
    window.addEventListener('scroll', this.loadOnScroll, { passive: true });
    this.loadItems();
  },
  beforeDestroy() {
    window.removeEventListener('scroll', this.loadOnScroll, { passive: true });
  },
  data: () => ({
    itemCount: 0,
    showMenu: false,
    menuPosition: {
      x: 0,
      y: 0,
    },
    selectedTrackPosition: null,
  }),
  methods: {
    loadOnScroll() {
      if (this.bottomVisible()) {
        this.loadItems();
      }
    },
    onSort(event) {
      const queue = this.items.slice(0);
      queue.move(event.oldIndex, event.newIndex);
      this.$store.commit('UPDATE_ZONE_GROUP', { groupId: this.activeZoneGroupId, update: { queue } });
      groupsAPI.reorderTracksInQueue(this.activeZoneGroupId, event.oldIndex, event.newIndex);
    },
    removeTrack() {
      const queue = this.items.slice(0);
      const index = queue.findIndex(track => track.queuePosition === this.selectedTrackPosition);
      if (index !== -1) {
        queue.splice(index, 1);
        this.$store.commit('UPDATE_ZONE_GROUP', { groupId: this.activeZoneGroupId, update: { queue } });
        groupsAPI.removeTracksFromQueue(this.activeZoneGroupId, [index]);
      }
    },
    playTrack() {
      groupsAPI.playTrackFromQueue(this.activeZoneGroupId, this.selectedTrackPosition);
    },
    showTrackMenu(event, queuePosition) {
      this.showMenu = false;
      this.menuPosition.x = event.clientX;
      this.menuPosition.y = event.clientY;
      this.selectedTrackPosition = queuePosition;
      this.$nextTick(() => {
        this.showMenu = true;
      });
    },
    bottomVisible() {
      const { scrollY } = window;
      const visible = document.documentElement.clientHeight;
      const pageHeight = document.documentElement.scrollHeight;
      const bottomOfPage = visible + scrollY >= pageHeight;
      return bottomOfPage || pageHeight < visible;
    },
    loadItems() {
      if (this.itemCount >= this.items.length) return;
      // Load 100 items at a time
      this.itemCount += 100;
      this.$nextTick(() => {
        if (this.bottomVisible()) {
          this.loadItems();
        }
      });
    },
  },
  computed: {
    activeZoneGroupId() {
      return this.$store.state.activeZoneGroupId;
    },
    itemsCopy: {
      get() {
        return this.items.slice(0, this.itemCount);
      },
      set() {
      },
    },
  },
};
</script>

<style>
.queue-list {
  background: rgba(0,0,0,0)!important;
}
.draggable > * {
  user-select: none;
}
</style>

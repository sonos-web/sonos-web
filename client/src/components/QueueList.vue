<template>
  <v-list class="queue-list" two-line>
     <draggable class="draggable" v-model="itemsCopy"
      :options="{draggable:'.queue-item'}" @sort="onSort">
      <template v-for="(track, index) in itemsCopy">
        <queue-item @remove-track="removeTrack" :track="track" :key="index"></queue-item>
      </template>
    </draggable>
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
  data: () => ({
    bottom: false,
    itemIndex: -1,
  }),
  created() {
    window.addEventListener('scroll', () => {
      this.bottom = this.bottomVisible();
    });
    this.addItem();
  },
  methods: {
    onSort(event) {
      const queue = this.items.slice(0);
      queue.move(event.oldIndex, event.newIndex);
      this.$store.commit('UPDATE_ZONE_GROUP', { groupId: this.activeZoneGroupId, update: { queue } });
      groupsAPI.reorderTracksInQueue(this.activeZoneGroupId, event.oldIndex, event.newIndex);
    },
    removeTrack(queuePosition) {
      const queue = this.items.slice(0);
      const index = queue.findIndex(track => track.queuePosition === queuePosition);
      if (index !== -1) {
        queue.splice(index, 1);
        this.$store.commit('UPDATE_ZONE_GROUP', { groupId: this.activeZoneGroupId, update: { queue } });
        groupsAPI.removeTracksFromQueue(this.activeZoneGroupId, [index]);
      }
    },
    bottomVisible() {
      const { scrollY } = window;
      // Add 300 px buffer so we can keep up with fast scrolling
      const visible = document.documentElement.clientHeight + 300;
      const pageHeight = document.documentElement.scrollHeight;
      const bottomOfPage = visible + scrollY >= pageHeight;
      return bottomOfPage || pageHeight < visible;
    },
    // The purpose of loading items this way instead of
    // returning entire array is that, loading album art images is expensive
    // and can slow down the browser, if we try to load them all at once
    // this way, we only load as many as we need to.
    addItem() {
      this.itemIndex += 1;
      if (this.itemsCopy.length === this.items.length) return;
      // Add a short delay to allow document height check to have a chance to update
      // otherwise we will load too many or all on initial load
      setTimeout(() => {
        this.itemsCopy.push(this.items[this.itemIndex]);
        if (this.bottomVisible()) {
          this.addItem();
        }
      }, 10);
    },
  },
  computed: {
    activeZoneGroupId() {
      return this.$store.state.activeZoneGroupId;
    },
    itemsCopy: {
      get() {
        return this.items.slice(0, this.itemIndex);
      },
      set() {
      },
    },
  },
  watch: {
    bottom(bottom) {
      if (bottom) {
        this.addItem();
      }
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

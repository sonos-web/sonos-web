<template>
  <div style="display: none;"></div>
</template>

<script>
export default {
  name: 'LoadLibraryOnScroll',
  props: {
    asyncLoadMethod: {
      type: Function,
      required: true,
    },
    requestedCount: {
      type: Number,
      default: 100,
    },
    libraryItem: {
      type: Object,
      required: true,
    },
    detailPath: {
      type: String,
      default: null,
    },
  },
  data: () => ({
    startIndex: 0,
    loadMoreItems: true,
    loading: false,
  }),
  created() {
    window.addEventListener('scroll', this.loadOnScroll, { passive: true });
    this.loadItems();
  },
  beforeDestroy() {
    window.removeEventListener('scroll', this.loadOnScroll, { passive: true });
  },
  methods: {
    loadOnScroll() {
      if (this.bottomVisible()) {
        this.loadItems();
      }
    },
    bottomVisible() {
      const { scrollY } = window;
      // Multiple, to start loading before we get to bottom
      const visible = document.documentElement.clientHeight * 2;
      const pageHeight = document.documentElement.scrollHeight;
      const bottomOfPage = visible + scrollY >= pageHeight;
      return bottomOfPage || pageHeight < visible;
    },
    async loadItems() {
      if (!this.loadMoreItems) return;
      if (this.loading) return;
      if (this.duplicateRequest) {
        this.loadMoreItems = false;
        return;
      }
      try {
        this.loading = true;
        let result;
        const options = { startIndex: this.startIndex, requestedCount: this.requestedCount };
        if (this.detailPath) {
          result = await this.asyncLoadMethod(this.detailPath, options);
        } else {
          result = await this.asyncLoadMethod(options);
        }
        // Update the startIndex for the next load
        const returnedCount = parseInt(result.data.returned, 10);
        if (returnedCount === this.requestedCount) {
          this.startIndex += this.requestedCount;
        } else {
          this.startIndex = returnedCount;
        }

        const totalItems = parseInt(result.data.total, 10);
        if (this.libraryItem.items) {
          this.loadMoreItems = (this.libraryItem.items.length + returnedCount) < totalItems;
        } else {
          this.loadMoreItems = returnedCount !== totalItems;
        }

        this.$emit('loaded-items', result.data);
        this.loading = false;
      } catch (error) {
        this.$emit('loading-error', error);
      }
    },
  },
  computed: {
    duplicateRequest() {
      const totalLength = this.startIndex + this.requestedCount;
      if (this.libraryItem.items && this.libraryItem.items.length >= totalLength) {
        return true;
      }
      return false;
    },
  },
};
</script>

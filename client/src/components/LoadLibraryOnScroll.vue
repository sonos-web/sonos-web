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
    total: {
      type: Number,
      default: 20,
    },
    libraryItem: {
      type: Object,
      required: true,
    },
    detailPath: {
      type: String,
      default: null,
    },
    searchTerm: {
      type: String,
      default: null,
    },
    resetItems: {
      type: Function,
      default: null,
    },
  },
  data: () => ({
    start: 0,
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
    loadFromSearch() {
      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
      }
      this.timeoutId = setTimeout(() => {
        this.timeoutId = null;
        this.loadMoreItems = true;
        this.start = 0;
        if (this.resetItems) this.resetItems();
        this.loadItems(true);
      }, 500);
    },
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
    async loadItems(search) {
      if (!this.loadMoreItems) return;
      if (this.loading) return;
      if (this.duplicateRequest && !search) {
        this.loadMoreItems = false;
        return;
      }
      try {
        this.loading = true;
        let result;
        const options = { start: this.start, total: this.total, searchTerm: this.searchTerm };
        if (this.detailPath) {
          result = await this.asyncLoadMethod(this.detailPath, options);
        } else {
          result = await this.asyncLoadMethod(options);
        }

        if (result.data.total === '0') {
          const error = new Error('404: Not Found');
          error.response = {
            status: 404,
            data: 'Item Not Found',
          };
          throw error;
        }

        // Update the start for the next load
        const returnedCount = parseInt(result.data.returned, 10);
        if (returnedCount === this.total) {
          this.start += this.total;
        } else {
          this.start = returnedCount;
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
      const totalLength = this.start + this.total;
      if (this.libraryItem.items && this.libraryItem.items.length >= totalLength) {
        return true;
      }
      return false;
    },
  },
  watch: {
    searchTerm() {
      this.loadFromSearch();
    },
  },
};
</script>

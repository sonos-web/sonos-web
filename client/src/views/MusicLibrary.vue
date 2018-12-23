<template>
  <LoadingView v-if="isLoading"></LoadingView>
</template>

<script>
export default {
  name: 'MusicLibrary',
  computed: {
    isLoading() {
      return this.$store.state.isLoading;
    },
  },
};
</script>

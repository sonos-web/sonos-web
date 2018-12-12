<template>
  <LoadingView v-if="isLoading"></LoadingView>
</template>

<script>
export default {
  name: 'NowPlaying',
  computed: {
    isLoading() {
      return this.$store.state.isLoading;
    },
  },
};
</script>
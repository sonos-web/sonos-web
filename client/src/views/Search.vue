<template>
  <v-container fluid fill-height>
    <LoadingView v-if="isLoading"></LoadingView>
    <vue-headful title="Search - Sonos Web"></vue-headful>
  </v-container>
</template>

<script>
export default {
  name: 'Search',
  computed: {
    isLoading() {
      return this.$store.state.isLoading;
    },
  },
};
</script>

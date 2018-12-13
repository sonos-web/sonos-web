<template>
  <v-container fluid>
    <v-layout align-center justify-center>
      <v-progress-circular indeterminate></v-progress-circular>
    </v-layout>
    <v-layout align-center justify-center>
      <v-subheader>{{ loadingMessage }}</v-subheader>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  name: 'LoadingView',
  computed: {
    loadingMessage() {
      return this.$store.state.loadingMessage
    }
  }
};

</script>

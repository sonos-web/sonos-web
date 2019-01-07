<template>
  <v-container fluid :style="style">
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
  props: {
    message: {
      type: String,
      default: null,
    },
    absolute: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    loadingMessage() {
      return this.message || this.$store.state.loadingMessage;
    },
    style() {
      if (this.absolute) {
        return {
          position: 'absolute',
          top: '50%',
          left: '0%',
        };
      }
      return {};
    },
  },
};

</script>

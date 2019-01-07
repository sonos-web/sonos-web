<template>
  <v-container fluid :style="style">
    <v-layout align-center justify-center>
      <v-flex xs6>
        <v-subheader class="justify-center">
          <v-icon class="pr-2">error</v-icon>{{ errorMessage }}
        </v-subheader>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  name: 'ErrorView',
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
    errorMessage() {
      return this.message || this.$store.state.errorMessage;
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

<template>
  <v-container fluid>
    <v-layout align-center justify-center>
      <v-flex xs6>
        <v-subheader><v-icon class="pr-2">error</v-icon>{{ errorMessage }}</v-subheader>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  name: 'ErrorView',
  computed: {
    errorMessage() {
      return this.$store.state.errorMessage;
    },
  },
};

</script>

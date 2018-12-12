<template>
  <v-container fluid>
    <v-layout align-center justify-center>
      <v-progress-circular indeterminate></v-progress-circular>
    </v-layout>
    <v-layout align-center justify-center>
      <v-subheader>Loading data...</v-subheader>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  name: 'LoadingView',
};

</script>

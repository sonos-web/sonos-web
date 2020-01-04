<template>
  <v-flex xs12 px-2 pb-2>
    <div class="subtitle-1
 font-weight-bold d-block no-select">
      {{ total }} <span class="grey--text text-uppercase caption font-weight-bold">{{ text }}</span>
    </div>
  </v-flex>
</template>

<script>
export default {
  name: 'LibraryItemCount',
  props: {
    total: {
      type: String,
      default: '0',
    },
    label: {
      type: String,
      required: true,
    },
  },
  computed: {
    text() {
      if (this.total === '1') {
        return this.label.slice(0, -1);
      }
      return this.label;
    },
  },
};
</script>

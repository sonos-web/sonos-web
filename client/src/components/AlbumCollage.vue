<template>
   <div class="album-collage" v-if="images.length >= 4">
    <div class="column">
      <div class="v-responsive v-image">
        <div class="v-responsive__sizer" style="padding-bottom: 100%;"></div>
        <div v-lazy:background-image="images[0]" class="background-image"></div>
      </div>
      <div class="v-responsive v-image">
        <div class="v-responsive__sizer" style="padding-bottom: 100%;"></div>
        <div v-lazy:background-image="images[2]" class="background-image"></div>
      </div>
    </div>
    <div class="column">
      <div class="v-responsive v-image">
        <div class="v-responsive__sizer" style="padding-bottom: 100%;"></div>
        <div v-lazy:background-image="images[1]" class="background-image"></div>
      </div>
      <div class="v-responsive v-image">
        <div class="v-responsive__sizer" style="padding-bottom: 100%;"></div>
        <div v-lazy:background-image="images[3]" class="background-image"></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AlbumCollage',
  props: {
    images: {
      type: Array,
      default: () => [],
    },
  },
};

</script>

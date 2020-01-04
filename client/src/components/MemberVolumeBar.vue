<template>
  <div>
    <div class="subheader pt-1">{{ zoneMember.name }}</div>
    <v-slider
      class="ma-0 pb-1 pt-1 volume-control"
      hide-details
      thumb-label
      color="#b3b3b3"
      track-color="dark-grey"
      :prepend-icon="volumeIcon"
      @click:prepend="toggleMute"
      v-model="volume">
    </v-slider>
  </div>
</template>


<script>
import zonesAPI from '@/services/API/zones';

export default {
  name: 'MemberVolumeBar',
  props: {
    zoneMember: {
      type: Object,
      required: true,
    },
  },
  methods: {
    toggleMute() {
      const mute = !this.zoneMember.mute;
      zonesAPI.mute(this.zoneMember.id, mute);
    },
  },
  computed: {
    volume: {
      get() {
        return this.zoneMember.volume;
      },
      set(volume) {
        zonesAPI.volume(this.zoneMember.id, volume);
      },
    },
    volumeIcon() {
      if (this.zoneMember.mute) return 'volume_mute';
      return this.volume > 50 ? 'volume_up' : 'volume_down';
    },
  },
};
</script>

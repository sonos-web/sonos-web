import SpotifyAPI from '@/services/API/services/spotify';

export default {
  data: () => ({
    authorized: null,
  }),
  async created() {
    if (this.$route.query.code) {
      try {
        const response = await SpotifyAPI.authorize(this.$route.query.code);
        this.$store.commit('UPDATE_SETTINGS', { property: 'spotify.refreshToken', value: response.data.refreshToken });
        this.authorized = true;
        this.$router.push({ name: 'SpotifyPlaylists' });
      } catch (error) {
        this.authorized = false;
        console.log(error);
      }
    } else {
      try {
        await SpotifyAPI.checkAuthorization(this.$store.state.settings.spotify);
        this.authorized = true;
        if (this.$route.name === 'Spotify') {
          this.$router.push({ name: 'SpotifyPlaylists' });
        }
      } catch (error) {
        this.authorized = false;
        console.log(error);
      }
    }
  },
};

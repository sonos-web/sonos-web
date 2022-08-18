const SpotifyWebApi = require('spotify-web-api-node');

class Spotify {
  constructor(sonosNetwork) {
    this.sonosNetwork = sonosNetwork;
    this.authScopes = ['user-read-private', 'user-library-read', 'playlist-read-private', 'streaming'];
    const port = process.env.NODE_ENV === 'production' ? process.env.PORT : process.env.CLIENT_PORT;
    this.credentials = {
      clientId: 'd8058916213248f4b40bc0cc6d69ae46',
      clientSecret: '2836db0cbfcc44e58de8c67265730a35',
      redirectUri: `http://localhost:${port}/spotify`,
    };
    this.spotifyApi = new SpotifyWebApi(this.credentials);
  }

  get authorizeURL() {
    return this.spotifyApi.createAuthorizeURL(this.authScopes, '');
  }

  async checkAuthorization(tokens) {
    if (this.spotifyApi.getAccessToken()) {
      return true;
    }
    if (tokens.refreshToken && tokens.refreshToken !== null) {
      this.spotifyApi.setRefreshToken(tokens.refreshToken);
      try {
        const data = await this.spotifyApi.refreshAccessToken();
        this.spotifyApi.setAccessToken(data.body.access_token);
        return true;
      } catch (error) {
        console.log(error);
        return false;
      }
    } else {
      return false;
    }
  }

  async authorizeCode(code) {
    const data = await this.spotifyApi.authorizationCodeGrant(code);
    this.spotifyApi.setAccessToken(data.body.access_token);
    this.spotifyApi.setRefreshToken(data.body.refresh_token);
    return { refreshToken: data.body.refresh_token };
  }

  async getUserPlaylists(options) {
    const refreshData = await this.spotifyApi.refreshAccessToken();
    this.spotifyApi.setAccessToken(refreshData.body.access_token);

    const data = await this.spotifyApi.getUserPlaylists(options);
    const items = data.body.items.map((item) => ({
      title: item.name,
      uri: item.uri,
      artist: null,
      album: null,
      albumArtURI: item.images[0].url,
    }));
    const result = { total: String(data.body.total), returned: String(items.length), items };
    return result;
  }

  async getUserAlbums(options) {
    const refreshData = await this.spotifyApi.refreshAccessToken();
    this.spotifyApi.setAccessToken(refreshData.body.access_token);
    const data = await this.spotifyApi.getMySavedAlbums(options);
    const items = data.body.items.map((item) => ({
      title: item.album.name,
      uri: item.album.uri,
      artist: item.album.artists[0].name,
      artistURI: item.album.artists[0].uri.split(':').slice(-1)[0],
      album: null,
      albumArtURI: item.album.images[0].url,
    }));
    const result = { total: String(data.body.total), returned: String(items.length), items };
    return result;
  }

  async getUserSongs(options) {
    const refreshData = await this.spotifyApi.refreshAccessToken();
    this.spotifyApi.setAccessToken(refreshData.body.access_token);

    const data = await this.spotifyApi.getMySavedTracks(options);
    const items = data.body.items.map((item) => ({
      title: item.track.name,
      uri: item.track.uri,
      artist: item.track.album.artists[0].name,
      artistURI: item.track.album.artists[0].uri.split(':').slice(-1)[0],
      albumURI: item.track.album.uri.split(':').slice(-1)[0],
      album: item.track.album.name,
      albumArtURI: item.track.album.images[0].url,
    }));
    return { total: String(data.body.total), returned: String(items.length), items };
  }

  async searchPlaylists(searchTerm, options) {
    const refreshData = await this.spotifyApi.refreshAccessToken();
    this.spotifyApi.setAccessToken(refreshData.body.access_token);
    const data = await this.spotifyApi.searchPlaylists(searchTerm, options);
    const items = data.body.playlists.items.map((item) => ({
      title: item.name,
      uri: item.uri,
      artist: null,
      album: null,
      albumArtURI: item.images[0].url,
    }));
    return { total: String(data.body.playlists.total), returned: String(items.length), items };
  }

  async searchAlbums(searchTerm, options) {
    const refreshData = await this.spotifyApi.refreshAccessToken();
    this.spotifyApi.setAccessToken(refreshData.body.access_token);
    const data = await this.spotifyApi.searchAlbums(searchTerm, options);
    const items = data.body.albums.items.map((item) => ({
      title: item.name,
      uri: item.uri,
      artist: item.artists[0].name,
      artistURI: item.artists[0].uri.split(':').slice(-1)[0],
      album: null,
      albumArtURI: item.images && item.images[0].url,
    }));
    return { total: String(data.body.albums.total), returned: String(items.length), items };
  }

  async searchArtists(searchTerm, options) {
    const refreshData = await this.spotifyApi.refreshAccessToken();
    this.spotifyApi.setAccessToken(refreshData.body.access_token);
    const data = await this.spotifyApi.searchArtists(searchTerm, options);
    const items = data.body.artists.items.map((item) => ({
      title: item.name,
      uri: item.uri,
      artist: null,
      album: null,
      albumArtURI: item.images[0] ? item.images[0].url : null,
    }));
    return { total: String(data.body.artists.total), returned: String(items.length), items };
  }

  async searchSongs(searchTerm, options) {
    const refreshData = await this.spotifyApi.refreshAccessToken();
    this.spotifyApi.setAccessToken(refreshData.body.access_token);
    const data = await this.spotifyApi.searchTracks(searchTerm, options);
    const items = data.body.tracks.items.map((item) => ({
      title: item.name,
      uri: item.uri,
      artist: item.album.artists[0].name,
      artistURI: item.album.artists[0].uri.split(':').slice(-1)[0],
      albumURI: item.album.uri.split(':').slice(-1)[0],
      album: item.album.name,
      albumArtURI: item.album.images[0].url,
    }));
    return { total: String(data.body.tracks.total), returned: String(items.length), items };
  }

  async getPlaylist(id) {
    const data = await this.spotifyApi.getPlaylist(id);
    const items = data.body.tracks.items.map((item) => ({
      title: item.track.name,
      uri: item.track.uri,
      artist: item.track.artists[0].name,
      artistURI: item.track.artists[0].uri.split(':').slice(-1)[0],
      album: item.track.album.name,
      albumURI: item.track.album.uri.split(':').slice(-1)[0],
      albumArtURI: item.track.album.images[0].url,
    }));
    return {
      total: String(data.body.tracks.total),
      returned: String(items.length),
      items,
      uri: data.body.uri,
      name: data.body.name,
      albumArtURI: data.body.images[0].url,
    };
  }

  async getAlbum(id) {
    const data = await this.spotifyApi.getAlbum(id);
    const items = data.body.tracks.items.map((item) => ({
      title: item.name,
      uri: item.uri,
    }));
    return {
      total: String(data.body.tracks.total),
      returned: String(items.length),
      items,
      uri: data.body.uri,
      name: data.body.name,
      artist: data.body.artists[0].name,
      artistURI: data.body.artists[0].uri.split(':').slice(-1)[0],
      albumArtURI: data.body.images[0].url,
    };
  }

  async getArtistAlbums(id) {
    const data = await this.spotifyApi.getArtistAlbums(id);
    const items = data.body.items.map((item) => ({
      title: item.name,
      uri: item.uri,
      albumArtURI: item.images[0].url,
    }));
    return {
      total: String(data.body.total),
      returned: String(items.length),
      items,
      uri: data.body.items[0].artists[0].uri,
      name: data.body.items[0].artists[0].name,
    };
  }
}

module.exports = Spotify;

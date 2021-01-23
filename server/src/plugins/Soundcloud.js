const qs = require('querystring');
const superagent = require('superagent');


class Soundcloud {
  constructor(sonosNetwork) {
    this.apiUrl = 'https://api-v2.soundcloud.com';
    this.sonosNetwork = sonosNetwork;
    const port = process.env.NODE_ENV === 'production' ? process.env.PORT : process.env.CLIENT_PORT;
    this.credentials = {
      client_secret: process.env.SOUNDCLOUD_CLIENT_SECRET,
      client_id: process.env.SOUNDCLOUD_CLIENT_ID,
      redirect_uri: `http://localhost:${port}/soundcloud`,
      response_type: 'code',
      scope: '*',
    };

    this.accessToken = process.env.SOUNDCLOUD_OAUTH;
  }

  get authorizeURL() {
    return `https://soundcloud.com/connect?${qs.stringify(this.credentials)}`;
  }

  async authorizeCode(code) {
    const data = await this.request({
      url: '/oauth/token',
      query: {
        ...this.credentials,
        grant_type: 'authorization_code',
        code,
      },
    });
    this.accessToken = data.body.access_token;
    return { refreshToken: data.body.refresh_token };
  }

  async request(options) {
    if (!options.query) options.query = {};
    if (this.credentials.client_id) options.query.client_id = this.credentials.client_id;

    return superagent.get(`${this.apiUrl}${options.url}`)
      .query(options.query)
      .set('Authorization', `OAuth ${this.accessToken}`);
  }

  async getStream(options) {
    try {
      if (options.offset === 0) {
        this.nextUUID = '';
        options.limit += 1;
      }
      const resp = await this.request({ url: '/stream', query: { ...options, offset: this.nextUUID } });
      const nextUUID = resp.body.next_href.match(/offset=([\w-]+)/);
      if (nextUUID) {
        this.nextUUID = nextUUID[1];
      }
      const items = resp.body.collection.map((item) => {
        const inner = item.track || item.playlist;
        return {
          title: inner.title,
          uri: item.track
            ? `x-sonos-http:track:${inner.id}.mp3?sid=160&flags=8224&sn=4`
            : `x-rincon-cpcontainer:1006206cplaylist%3a${inner.id}?sid=160&flags=8300&sn=4`,
          artist: item.user.username,
          artistId: item.user.id,
          album: null,
          type: inner.kind,
          id: inner.id,
          albumArtURI: inner.artwork_url && inner.artwork_url.replace('large', 't500x500'),
        };
      });

      return {
        // total: String(resp.body.total),
        total: '9999',
        returned: String(options.limit || items.length),
        items,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getPlaylist(id) {
    try {
      const resp = await this.request({ url: `/playlists/${id}` });

      const toLookup = [];
      resp.body.tracks.forEach((item) => {
        if (!item.user) toLookup.push(item.id);
      });

      const lookedUp = toLookup.length ? await this.getTracks(toLookup) : [];
      const trackById = {};
      lookedUp.forEach((track) => {
        trackById[track.id] = track;
      });

      const items = resp.body.tracks.map((item) => {
        if (!item.user) item = trackById[item.id];
        return {
          title: item.title,
          uri: `x-sonos-http:track:${item.id}.mp3?sid=160&flags=8224&sn=4`,
          artist: item.user && item.user.username,
          album: null,
          id: item.id,
          artistId: item.user.id,
          type: item.kind,
          albumArtURI: item.artwork_url,
          description: item.description,
        };
      });
      return {
        total: String(resp.body.track_count),
        returned: String(items.length),
        items,
        uri: `x-rincon-cpcontainer:1006206cplaylist%3a${id}?sid=160&flags=8300&sn=4`,
        name: resp.body.title,
        albumArtURI: resp.body.artwork_url && resp.body.artwork_url.replace('large', 't500x500'),
        isAlbum: resp.body.is_album,
        description: resp.body.description,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getArtist(id, options) {
    try {
      if (options.offset === 0) {
        this.nextUserUUID = '';
      }

      const resp = await this.nextArtist(id, options);
      const items = this.parseArtists(resp);
      while (items.length < options.limit && this.nextUserUUID) {
        const next = await this.nextArtist(id, options);
        const nextItems = this.parseArtists(next);
        items.push(...nextItems);
      }

      return {
        total: String(9999),
        returned: String(items.length),
        items,
        uri: `x-rincon-cpcontainer:100f206cuser-tracks%3a${id}?sid=160&flags=8300&sn=4`,
        name: resp.body.collection.length && resp.body.collection[0].user.username,
        albumArtURI: resp.body.collection.length && resp.body.collection[0].user.avatar_url.replace('large', 't500x500'),
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async nextArtist(id, options) {
    const resp = await this.request({ url: `/users/${id}/tracks`, query: { ...options, offset: this.nextUserUUID } });
    const nextUUID = resp.body.next_href.match(/offset=([\w-%.]+)/);
    if (nextUUID) {
      this.nextUserUUID = decodeURIComponent(nextUUID[1]);
    } else {
      this.nextUserUUID = '';
    }
    return resp;
  }

  parseArtists(resp) {
    return resp.body.collection.map((item) => {
      return {
        title: item.title,
        uri: `x-sonos-http:track:${item.id}.mp3?sid=160&flags=8224&sn=4`,
        artist: item.user.username,
        artistId: item.user.id,
        album: null,
        type: item.kind,
        id: item.id,
        albumArtURI: item.artwork_url && item.artwork_url.replace('large', 't500x500'),
      };
    });
  }

  async getTracks(ids) {
    const resp = await this.request({ url: '/tracks', query: { ids: ids.join(',') } });
    return resp.body;
  }

  async getRelated(id, options) {
    try {
      const offset = options.offset && options.limit ? ((options.offset / options.limit) + 1) : 0;
      const resp = await this.request({ url: `/tracks/${id}/related`, query: { ...options, offset } });

      const tracks = await this.getTracks([id]);
      const track = tracks[0];

      const items = resp.body.collection.map((item) => ({
        title: item.title,
        uri: `x-sonos-http:track:${item.id}.mp3?sid=160&flags=8224&sn=4`,
        artist: item.user && item.user.username,
        artistId: item.user.id,
        album: null,
        id: item.id,
        type: item.kind,
        albumArtURI: item.artwork_url,
        description: item.description,
      }));
      return {
        total: String(9999),
        returned: String(items.length),
        items,
        name: track.title,
        uri: `x-sonos-http:track:${track.id}.mp3?sid=160&flags=8224&sn=4`,
        albumArtURI: track.artwork_url.replace('large', 't500x500'),
        description: track.description,
        artist: track.user && track.user.username,
        artistId: track.user.id,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async search(term, options) {
    try {
      const resp = await this.request({ url: '/search', query: { q: term, ...options } });
      const items = resp.body.collection.filter((item) => item.kind !== 'user')
        .map((item) => ({
          title: item.title,
          uri: `x-sonos-http:track:${item.id}.mp3?sid=160&flags=8224&sn=4`,
          artist: item.user && item.user.username,
          artistId: item.user.id,
          album: null,
          id: item.id,
          type: item.kind,
          albumArtURI: item.artwork_url,
          description: item.description,
        }));
      return {
        total: String(resp.body.total_results),
        returned: String(items.length),
        items,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}

module.exports = Soundcloud;

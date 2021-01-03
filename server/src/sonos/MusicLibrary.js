const deepmerge = require('deepmerge');
const {
  NotASonosDevice,
  NoResultsFound,
} = require('./MusicLibraryErrors');

class MusicLibrary {
  /**
   * A Sonos device is required to initialize the Music Library
   * @param {Sonos} Sonos
   */
  constructor(Sonos) {
    this.sonos = Sonos;
    if (!this.sonos) { throw new Error(NotASonosDevice); }

    this._playlistCache = null;
    this._sonosPlaylistCache = null;
    this._browseCache = [];
  }

  /*
   *************************************************************************************************
   *************************************************************************************************
   * PUBLIC LIBRARY QUERY METHODS
   *************************************************************************************************
   *************************************************************************************************
   */

  /**
   * Returns an object with music library data
   * @param {Object} browseOptions
   * searchCategory: String (Required) The name of the library item to search
   *
   * searchTerm: String (Optional)
   *
   * searchOptions: Object (Optional) { start: Number, total: Number }
   *
   * search: Boolean (Optional) Is this a search, or a normal browse? Default is false (browse)
   *
   * getAlbumArt: Boolean (Optional) Return album art for items that don't normally return album art
   *
   * uri: String (Optional) Used for playlists mainly -- See _getSearchOptions for more details
   *
   * @returns {Object} {returned: Number, total: Number, items: Array}
   */
  async browse(browseOptions) {
    const defaultOptions = {
      searchCategory: null,
      searchTerm: null,
      searchOptions: {},
      search: false,
      getAlbumArt: true,
      uri: '',
    };
    const options = deepmerge(defaultOptions, browseOptions);
    const cache = this._getCache(options);
    if (cache) return cache;

    try {
      // eslint-disable-next-line max-len
      const { category, term, separator } = MusicLibrary._getSearchOptions(options.searchCategory, options.searchTerm, options.uri, options.search);
      // for some reason _getSearchOptions is returning an encodedVersion
      // of the term that affects share searchTerms
      const searchTerm = category === 'share' && term ? decodeURI(term) : term;
      // eslint-disable-next-line max-len
      const result = await this.sonos.searchMusicLibrary(category, searchTerm, options.searchOptions, separator);
      if (!result) return MusicLibrary._getEmptyReturnResult();
      if (options.getAlbumArt && result.items) {
        switch (options.searchCategory) {
          case 'albumArtists':
          case 'genres':
          case 'playlists':
            await Promise.all(result.items.map(async (item, index) => {
              try {
                // Get the album art
                if (item.title !== 'All') {
                  if (result.items[index].albumArtURI === null) {
                    // eslint-disable-next-line max-len
                    result.items[index].albumArtURI = await this._getAlbumArt(options.searchCategory, item.title, item.uri);
                  }
                }
              } catch (error) {
                if (error.message !== NoResultsFound) {
                  throw error;
                }
              }
            }));
            break;
          default:
            break;
        }
      }

      // Add this query to the cache
      this._browseCache.push({
        searchCategory: options.searchCategory,
        searchTerm: options.searchTerm,
        searchOptions: options.searchOptions,
        data: result,
      });

      return result;
    } catch (error) {
      throw error;
    }
  }

  async getTopResults(options) {
    const items = ['albumArtists', 'albums', 'tracks', 'playlists', 'genres'];
    const topResults = { searchTerm: options.searchTerm };

    await Promise.all(items.map(async (item) => {
      const total = item === 'tracks' ? 5 : 12;
      const result = await this.browse({
        searchCategory: item,
        searchTerm: options.searchTerm,
        searchOptions: { start: 0, total },
        search: true,
      });
      if (result.items && result.items.length) {
        topResults[item] = result;
      }
    }));

    topResults.sonos_playlists = await this.searchSonosPlaylists({
      searchTerm: options.searchTerm,
      searchOptions: { start: 0, total: 12 },
    });
    return topResults;
  }

  async getFavorites() {
    try {
      const result = await this.sonos.getFavorites();
      return result;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Converts a playlistName into its uri for searching on Sonos
   * @param {String} playlistName
   * @returns {String|null} playlistURI
   */
  async getPlaylistURI(playlistName) {
    if (this._playlistCache) {
      const playlist = this._playlistCache.items.find(p => p.title === playlistName);
      if (playlist) return playlist.uri;
      return null;
    }
    try {
      const playlists = await this.sonos.getMusicLibrary('playlists');
      if (!playlists) throw new Error(NoResultsFound);
      this._playlistCache = playlists;
      const playlist = playlists.items.find(p => p.title === playlistName);
      if (playlist) return playlist.uri;
      return null;
    } catch (error) {
      throw error;
    }
  }


  /**
   * Get Sonos Playlists
   * @returns {Array} sonos playlists
   */
  async getSonosPlaylists(searchOptions) {
    const defaultOptions = {
      searchOptions: { start: 0, total: 100 },
    };
    const options = { ...defaultOptions, ...searchOptions };
    if (this._sonosPlaylistCache) {
      if (!this._sonosPlaylistCache.items) return MusicLibrary._getEmptyReturnResult();
      const items = this._sonosPlaylistCache.items.slice(options.start, options.total);
      return {
        total: String(this._sonosPlaylistCache.length),
        returned: String(items.length),
        items,
      };
    }
    try {
      const playlists = await this.sonos.getMusicLibrary('sonos_playlists');
      if (!playlists) throw new Error(NoResultsFound);
      this._sonosPlaylistCache = playlists;
      if (!playlists.items) return MusicLibrary._getEmptyReturnResult();
      const items = playlists.items.slice(options.start, options.total);
      return {
        total: String(playlists.length),
        returned: String(items.length),
        items,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Converts a playlistName into its id for searching on Sonos
   * @param {String} playlistName
   * @returns {String|null} playlistId
   */
  async getSonosPlaylistId(playlistName) {
    try {
      const playlists = await this.getSonosPlaylists();
      const playlist = playlists.items.find(p => p.title === playlistName);
      if (playlist) return playlist.uri.split('#')[1];
      return null;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get a playlist uri from the name
   * @param {String} playlistName
   * @returns {String|null} uri
   */
  async getSonosPlaylistURI(playlistName) {
    try {
      const playlists = await this.getSonosPlaylists();
      const playlist = playlists.items.find(p => p.title === playlistName);
      if (playlist) return playlist.uri;
      return null;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get Sonos Playlists
   * @param {Object} options - { searchTerm: String, searchOptions: { start: Number, total: Number } }
   * @returns {Array} sonos playlists
   */
  async searchSonosPlaylists(options) {
    try {
      const playlists = await this.getSonosPlaylists(options);
      // eslint-disable-next-line max-len
      const results = playlists.items.filter(p => p.title.toLowerCase().indexOf(options.searchTerm.toLowerCase()) !== -1);
      return { returned: String(results.length), total: String(results.length), items: results };
    } catch (error) {
      throw error;
    }
  }

  /*
   *************************************************************************************************
   *************************************************************************************************
   * HELPERS
   *************************************************************************************************
   *************************************************************************************************
   */


  /**
  * Returns a cached query or null
  * @param {Object} options
  * @returns {Object|null} cache data or null
  */
  _getCache(options) {
    const match = this._browseCache.find((cache) => {
      if (options.searchCategory === cache.searchCategory
      && options.searchTerm === cache.searchTerm
      && options.searchOptions.start === cache.searchOptions.start
      && options.searchOptions.total === cache.searchOptions.total) {
        return cache;
      }
      return null;
    });
    return match ? match.data : null;
  }

  /**
   * Returns album art URI for the first album found
   *
   */
  async _getAlbumArt(searchCategory, searchTerm, uri) {
    if (searchCategory === 'playlists') {
      // eslint-disable-next-line no-param-reassign
      searchTerm = await this.getPlaylistURI(searchTerm);
    }

    try {
      // eslint-disable-next-line max-len
      const { category, term, separator } = MusicLibrary._getSearchOptions(searchCategory, searchTerm, uri);
      // eslint-disable-next-line max-len
      let search = await this.sonos.searchMusicLibrary(category, decodeURI(term), {}, separator);
      if (!search) throw new Error(NoResultsFound);

      // Build a collage of album art
      if (searchCategory === 'playlists') {
        const songs = search.items.filter(item => item.albumArtURI !== null);
        // Get a list of 4 unique albums
        const uniqueAlbums = [...new Set(songs.map(song => song.album))].slice(0, 4);
        if (uniqueAlbums.length === 4) {
          // return 4 unique album art image links
          return uniqueAlbums.map((album) => {
            const song = songs.find(item => item.album === album);
            return song.albumArtURI;
          });
        }
      }

      let album = search.items.find(item => item.albumArtURI !== null);
      if (album) {
        return album.albumArtURI;
      }

      try {
        // No album art found, let's dig deeper on the 'All' item.
        // Useful for returning album art for Genres
        search = await this.browse({
          searchCategory,
          searchTerm: `${searchTerm}//`,
          searchOptions: { start: 0, total: 1 },
          getAlbumArt: false,
        });
        if (search.items) [album] = search.items;
        if (album && album.albumArtURI !== null) {
          return album.albumArtURI;
        }

        // For returning album art of artists when browsing genres
        if (searchCategory === 'genres') {
          search = await this.browse({
            searchCategory: 'albumArtists',
            searchTerm,
            searchOptions: { start: 0, total: 2 },
            getAlbumArt: false,
          });
          album = search.items.find(item => item.albumArtURI !== null);
          if (album) {
            return album.albumArtURI;
          }
        }
      } catch (error) {
        throw error;
      }
      return null;
    } catch (error) {
      throw error;
    }
  }

  /*
   *************************************************************************************************
   *************************************************************************************************
   * STATIC HELPERS
   *************************************************************************************************
   *************************************************************************************************
   */

  static _getSearchOptions(searchCategory, searchTerm, uri = '', search) {
    // ':' is used for when searching on a category or getting all of that category
    // Ex. A:ALBUM: | A:ALBUM:Aw
    let separator = ':';
    // When browsing we need a / ex. A:ALBUM/One
    if (searchTerm && (searchTerm.indexOf('/') !== -1 || !search)) {
      separator = '/';
    }

    let category = searchCategory;
    let term = searchTerm;
    const playlistPrefix = 'x-file-cifs:';
    if (category === 'share'
    || uri.indexOf(playlistPrefix) !== -1
    || (term && term.indexOf(playlistPrefix) !== -1)) {
      category = 'share';
      separator = ':';
      if (uri && term) {
        term = uri.replace(playlistPrefix, '');
      } else if (term) {
        term = term.replace(playlistPrefix, '');
      }
    }
    return { category, term, separator };
  }

  static _getEmptyReturnResult() {
    return {
      items: [],
      total: '0',
      returned: '0',
    };
  }

  static _merge(libraryItem, newItem) {
    let item = libraryItem;
    if (item) {
      item = deepmerge(item, newItem);
    } else {
      item = newItem;
    }
    return item;
  }
}

module.exports = MusicLibrary;

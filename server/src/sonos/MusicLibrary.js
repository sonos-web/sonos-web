const deepmerge = require('deepmerge');
const {
  NotASonosDevice,
  EmptyOrInvalidLibraryItem,
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

    this._cache = {
      artists: null,
      albumArtists: null,
      albums: null,
      genres: null,
      composers: null,
      tracks: null,
      playlists: null,
      sonos_playlists: null,
      share: null,
    };
  }

  /**
   *************************************************************************************************
   *************************************************************************************************
   * PUBLIC LIBRARY QUERY METHODS
   *************************************************************************************************
   *************************************************************************************************
   */

  /**
   * Returns an object with music library data
   * @param {Object} requestOptions default { startIndex: 0, requestedCount: 100, albumArt: true }
   * startIndex: Number The 0-based index to start grabbing data
   *
   * requestedCount: Number The desired number of items (be sure to check actual returned)
   *
   * albumArt: Boolean Return the image URI to the artists' first album
   *
   * libraryItem: String (Required) The name of the library item to return
   * @returns {Object} {returned: Number, total: Number, items: Array}
   */

  async getLibraryItem(requestOptions) {
    const defaultOptions = {
      startIndex: 0,
      requestedCount: 100,
      albumArt: true,
      libraryItem: null,
    };
    const options = { ...defaultOptions, ...requestOptions };
    return new Promise((resolve, reject) => {
      if (!options.libraryItem) reject(new Error(EmptyOrInvalidLibraryItem));

      const libraryItem = this._cache[options.libraryItem];
      if (libraryItem === undefined) reject(new Error(EmptyOrInvalidLibraryItem));

      // Return cache if possible
      const cache = MusicLibrary._getCache(libraryItem, options);
      if (cache) {
        resolve(cache);
      } else {
        const { start, total } = MusicLibrary._getRequestOptions(libraryItem, options);
        this.sonos.getMusicLibrary(options.libraryItem, { start, total }).then((async (data) => {
          const newItems = data;
          if (options.albumArt) {
            switch (options.libraryItem) {
              case 'albumArtists':
              case 'genres':
              case 'playlists':
                await Promise.all(newItems.items.map(async (item, index) => {
                  try {
                    // Get the album art
                    // eslint-disable-next-line max-len
                    newItems.items[index].albumArtURI = await this._getAlbumArt(options.libraryItem, item.title, item.uri);
                  } catch (error) {
                    reject(error);
                  }
                }));
                break;
              default:
                break;
            }
          }
          // Cache the results
          this._cache[options.libraryItem] = MusicLibrary._merge(libraryItem, newItems);
          resolve(MusicLibrary._getReturnResult(this._cache[options.libraryItem], options));
        })).catch((error) => {
          reject(error);
        });
      }
    });
  }

  async browse(browseOptions) {
    const defaultOptions = {
      searchCategory: null,
      searchTerm: null,
      uri: '',
      searchOptions: {},
      browseDepth: 0,
    };
    const options = deepmerge(defaultOptions, browseOptions);
    // eslint-disable-next-line max-len
    if (this._cache[options.searchCategory] === undefined) throw new Error(EmptyOrInvalidLibraryItem);

    // eslint-disable-next-line max-len
    const { category, terms, separator } = MusicLibrary._getSearchOptions(options.searchCategory, options.searchTerm, options.uri);
    try {
      // eslint-disable-next-line max-len
      const result = await this.sonos.searchMusicLibrary(category, terms, options.searchOptions, separator, options.browseDepth);
      if (!result) throw new Error(NoResultsFound);
      // Get album art for artists when browsing genres
      if (category === 'genres' && options.browseDepth === 0) {
        await Promise.all(result.items.map(async (item, index) => {
          try {
            // Get the album art
            if (item.title !== 'All') {
              const search = 'artists';
              // eslint-disable-next-line max-len
              result.items[index].albumArtURI = await this._getAlbumArt(search, item.title, item.uri);
            }
          } catch (error) {
            throw error;
          }
        }));
      }
      return result;
    } catch (error) {
      throw error;
    }
  }

  async getPlaylistURI(playlistName) {
    if (this._cache.playlists) {
      const playlist = this._cache.playlists.items.find(p => p.title === playlistName);
      if (playlist) return playlist.uri;
      return null;
    }
    try {
      const playlists = await this.getLibraryItem({ libraryItem: 'playlists' });
      this._cache.playlists = playlists;
      const playlist = playlists.items.find(p => p.title === playlistName);
      if (playlist) return playlist.uri;
      return null;
    } catch (error) {
      throw error;
    }
  }

  /**
   *************************************************************************************************
   *************************************************************************************************
   * HELPERS
   *************************************************************************************************
   *************************************************************************************************
   */

  /**
   * Returns album art URI for the first album found
   * @param {String} artistName
   * @returns {String|null}
   */
  async _getAlbumArt(searchCategory, searchTerm, uri) {
    try {
      let search = await this.browse({ searchCategory, searchTerm, uri });
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
      // No album art found, let's dig deeper on the 'All' item.
      search = await this.browse({
        searchCategory,
        searchTerm,
        requestOptions: { start: 0, total: 1 },
        browseDepth: 2,
      });
      [album] = search.items;
      if (album && album.albumArtURI !== null) {
        return album.albumArtURI;
      }
      return null;
    } catch (error) {
      throw error;
    }
  }

  /**
   *************************************************************************************************
   *************************************************************************************************
   * STATIC HELPERS
   *************************************************************************************************
   *************************************************************************************************
   */

  static _getSearchOptions(searchCategory, searchTerms, uri = '') {
    let separator = '/';
    let category = searchCategory;
    let terms = searchTerms;
    const playlistPrefix = 'x-file-cifs:';
    if (category === 'share'
    || uri.indexOf(playlistPrefix) !== -1
    || terms.indexOf(playlistPrefix) !== -1) {
      category = 'share';
      if (uri) {
        terms = uri.replace(playlistPrefix, '');
      } else {
        terms = terms.replace(playlistPrefix, '');
      }
      separator = ':';
    }
    return { category, terms, separator };
  }

  static _getCache(libraryItem, options) {
    const lengthNeeded = options.startIndex + options.requestedCount;
    if (libraryItem
        && libraryItem.items
        && libraryItem.items.length !== 0
        && libraryItem.items.length >= Math.min(lengthNeeded, parseInt(libraryItem.total, 10))) {
      return MusicLibrary._getReturnResult(libraryItem, options);
    }
    return null;
  }

  static _getRequestOptions(libraryItem, options) {
    const lengthNeeded = options.startIndex + options.requestedCount;
    const cachedItems = libraryItem ? libraryItem.items : [];
    // Only fetch items that we do not have a cache for
    let start = options.startIndex;
    let total = options.requestedCount;
    if (cachedItems.length > options.startIndex) {
      start = cachedItems.length;
      total = lengthNeeded - cachedItems.length;
    }
    return { start, total };
  }

  static _getReturnResult(libraryItem, options) {
    const lengthNeeded = options.startIndex + options.requestedCount;
    const items = libraryItem.items.slice(options.startIndex, lengthNeeded);
    return {
      items,
      total: libraryItem.total,
      returned: items.length,
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

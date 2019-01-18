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
      albumArtists: null,
      albums: null,
      genres: null,
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
    const libraryItem = this._cache[options.searchCategory];
    if (libraryItem === undefined) throw new Error(EmptyOrInvalidLibraryItem);

    // // Not caching searches yet
    // if (!options.search && options.searchCategory !== 'playlists' && options.searchCategory !== 'share') {
    //   // Return cache if possible
    //   const cache = MusicLibrary._getCache(libraryItem, options.searchOptions);
    //   if (cache) return cache;
    // }

    try {
      // eslint-disable-next-line max-len
      const { category, term, separator } = MusicLibrary._getSearchOptions(options.searchCategory, options.searchTerm, options.uri, options.search);
      // for some reason _getSearchOptions is returning an encodedVersion
      // of the term that affects share searchTerms
      const searchTerm = category === 'share' && term ? decodeURI(term) : term;
      // eslint-disable-next-line max-len
      const result = await this.sonos.searchMusicLibrary(category, searchTerm, options.searchOptions, separator);
      if (!result) return MusicLibrary._getEmptyReturnResult();
      if (options.getAlbumArt) {
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

      return result;
      // // Not caching searches yet
      // if (options.search || options.searchCategory === 'playlists' || options.searchCategory === 'share') return result;

      // // Cache the results
      // this._cache[options.searchCategory] = MusicLibrary._merge(libraryItem, result);
      // // eslint-disable-next-line max-len
      // return MusicLibrary._getReturnResult(this._cache[options.searchCategory], options.searchOptions);
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
      if (result.items.length) {
        topResults[item] = result;
      }
    }));
    return topResults;
  }

  /**
   * Converts a playlistName into its uri for searching on Sonos
   * @param {String} playlistName
   * @returns {String|null} playlistURI
   */
  async getPlaylistURI(playlistName) {
    if (this._cache.playlists) {
      const playlist = this._cache.playlists.items.find(p => p.title === playlistName);
      if (playlist) return playlist.uri;
      return null;
    }
    try {
      // eslint-disable-next-line max-len
      const playlists = await this.sonos.getMusicLibrary('playlists');
      if (!playlists) throw new Error(NoResultsFound);
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
        [album] = search.items;
        if (album && album.albumArtURI !== null) {
          return album.albumArtURI;
        }
      } catch (error) {
        if (error.message === NoResultsFound) {
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
        } else {
          throw error;
        }
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

  static _getCache(libraryItem, options) {
    const lengthNeeded = options.start + options.total;
    if (libraryItem
        && libraryItem.items
        && libraryItem.items.length !== 0
        && libraryItem.items.length >= Math.min(lengthNeeded, parseInt(libraryItem.total, 10))) {
      return MusicLibrary._getReturnResult(libraryItem, options);
    }
    return null;
  }

  static _getRequestOptions(libraryItem, options) {
    let start = { options };
    let total = { options };
    const lengthNeeded = start + total;
    const cachedItems = libraryItem ? libraryItem.items : [];
    // Only fetch items that we do not have a cache for
    if (cachedItems.length > start) {
      start = cachedItems.length;
      total = lengthNeeded - cachedItems.length;
    }
    return { start, total };
  }

  static _getReturnResult(libraryItem, options) {
    const lengthNeeded = options.start + options.total;
    const items = libraryItem.items.slice(options.start, lengthNeeded);
    return {
      items,
      total: libraryItem.total,
      returned: items.length,
    };
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

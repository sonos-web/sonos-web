import Vue from 'vue';
import Router from 'vue-router';
import store from './store';
// route level code-splitting
// this generates a separate chunk (about.[hash].js) for this route
// which is lazy-loaded when the route is visited.

const Search = () => import(/* webpackChunkName: "Search" */ './views/Search.vue');
const SearchTopResults = () => import(/* webpackChunkName: "SearchTopResults" */ './views/SearchTopResults.vue');

const NowPlaying = () => import(/* webpackChunkName: "NowPlaying" */ './views/NowPlaying.vue');
const Rooms = () => import(/* webpackChunkName: "Rooms" */ './views/rooms/Rooms.vue');

const MusicLibrary = () => import(/* webpackChunkName: "MusicLibrary" */ './views/MusicLibrary.vue');
const Artists = () => import(/* webpackChunkName: "Artists" */ './views/library/Artists.vue');
const Albums = () => import(/* webpackChunkName: "Albums" */ './views/library/Albums.vue');
const Songs = () => import(/* webpackChunkName: "Songs" */ './views/library/Songs.vue');
const Genres = () => import(/* webpackChunkName: "Genres" */ './views/library/Genres.vue');
const Playlists = () => import(/* webpackChunkName: "Playlists" */ './views/library/Playlists.vue');
const Shares = () => import(/* webpackChunkName: "Shares" */ './views/library/Shares.vue');

const Artist = () => import(/* webpackChunkName: "Artist" */ './views/library/detail/Artist.vue');
const Album = () => import(/* webpackChunkName: "Album" */ './views/library/detail/Album.vue');
const Genre = () => import(/* webpackChunkName: "Genre" */ './views/library/detail/Genre.vue');
const Share = () => import(/* webpackChunkName: "Share" */ './views/library/detail/Share.vue');

const MySonos = () => import(/* webpackChunkName: "MySonos" */ './views/MySonos.vue');
const SonosPlaylists = () => import(/* webpackChunkName: "SonosPlaylists" */ './views/sonos/SonosPlaylists.vue');
const SonosFavorites = () => import(/* webpackChunkName: "SonosFavorites" */ './views/sonos/SonosFavorites.vue');

const PlayQueue = () => import(/* webpackChunkName: "PlayQueue" */ './views/PlayQueue.vue');

const Spotify = () => import(/* webpackChunkName: "Spotify" */ './views/services/Spotify.vue');
const SpotifyPlaylists = () => import(/* webpackChunkName: "SpotifyPlaylists" */ './views/spotify/SpotifyPlaylists.vue');
const SpotifyAlbums = () => import(/* webpackChunkName: "SpotifyAlbums" */ './views/spotify/SpotifyAlbums.vue');
const SpotifySongs = () => import(/* webpackChunkName: "SpotifySongs" */ './views/spotify/SpotifySongs.vue');
const SpotifySearch = () => import(/* webpackChunkName: "SpotifySearch" */ './views/spotify/SpotifySearch.vue');

const SpotifyAlbum = () => import(/* webpackChunkName: "SpotifyAlbum" */ './views/spotify/SpotifyAlbum.vue');
const SpotifyArtist = () => import(/* webpackChunkName: "SpotifyArtist" */ './views/spotify/SpotifyArtist.vue');

const Soundcloud = () => import(/* webpackChunkName: "Soundcloud" */ './views/services/Soundcloud.vue');
const SoundcloudStream = () => import(/* webpackChunkName: "SoundcloudStream" */ './views/soundcloud/SoundcloudStream.vue');
const SoundcloudPlaylist = () => import(/* webpackChunkName: "SoundcloudStream" */ './views/soundcloud/SoundcloudPlaylist.vue');
const SoundcloudSearch = () => import(/* webpackChunkName: "SoundcloudSearch" */ './views/soundcloud/SoundcloudSearch.vue');

Vue.use(Router);
const router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'NowPlaying',
      component: NowPlaying,
    },
    {
      path: '/search',
      name: 'Search',
      component: Search,
      children: [
        {
          path: '/search/results/*',
          name: 'SearchResults',
          component: SearchTopResults,
        },
        {
          path: '/search/artists/*',
          name: 'SearchArtists',
          component: Artists,
          props: { search: true },
        },
        {
          path: '/search/albums/*',
          name: 'SearchAlbums',
          component: Albums,
          props: { search: true },
        },
        {
          path: '/search/songs/*',
          name: 'SearchSongs',
          component: Songs,
          props: { search: true },
        },
        {
          path: '/search/genres/*',
          name: 'SearchGenres',
          component: Genres,
          props: { search: true },
        },
        {
          path: '/search/playlists/*',
          name: 'SearchPlaylists',
          component: Playlists,
          props: { search: true },
        },
        {
          path: '/search/sp/*',
          name: 'SearchSonosPlaylists',
          component: SonosPlaylists,
          props: { search: true },
        },
      ],
    },
    {
      path: '/rooms',
      name: 'Rooms',
      component: Rooms,
    },
    {
      path: '/library',
      component: MusicLibrary,
      children: [
        {
          path: '',
          name: 'library',
          redirect: { name: 'Artists' },
        },
        {
          path: '/library/artists',
          name: 'Artists',
          component: Artists,
        },
        {
          path: '/library/albums',
          name: 'Albums',
          component: Albums,
        },
        {
          path: '/library/songs',
          name: 'Songs',
          component: Songs,
        },
        {
          path: '/library/genres',
          name: 'Genres',
          component: Genres,
        },
        {
          path: '/library/playlists',
          name: 'Playlists',
          component: Playlists,
        },
        {
          path: '/library/share',
          name: 'Shares',
          component: Shares,
        },
      ],
    },
    {
      path: '/artist/all/*',
      name: 'AllArtist',
      component: Album,
    },
    {
      path: '/artist/*',
      name: 'Artist',
      component: Artist,
    },
    {
      path: '/album/*',
      name: 'Album',
      component: Album,
    },
    {
      path: '/genre/all/*/songs',
      name: 'AllGenre',
      component: Album,
      props: { isGenrePlaylist: true },
    },
    {
      path: '/genre/*',
      name: 'Genre',
      component: Genre,
    },
    {
      path: '/playlist/*',
      name: 'Playlist',
      component: Album,
      props: { isNormalPlaylist: true },
    },
    {
      path: '/share/*',
      name: 'Share',
      component: Share,
    },
    {
      path: '/sp/*',
      name: 'Sonos Playlist',
      component: Album,
      props: { isSonosPlaylist: true },
    },
    {
      path: '/queue',
      name: 'PlayQueue',
      component: PlayQueue,
    },
    {
      path: '/sonos',
      component: MySonos,
      children: [
        {
          path: '',
          name: 'sonos',
          redirect: { name: 'SonosPlaylists' },
        },
        {
          path: '/sonos/playlists',
          name: 'SonosPlaylists',
          component: SonosPlaylists,
        },
        {
          path: '/sonos/favorites',
          name: 'SonosFavorites',
          component: SonosFavorites,
        },
      ],
    },
    {
      path: '/spotify',
      component: Spotify,
      children: [
        {
          path: '',
          name: 'spotify',
          redirect: { name: 'SpotifyPlaylists' },
        },
        {
          path: '/spotify/playlists',
          name: 'SpotifyPlaylists',
          component: SpotifyPlaylists,
        },
        {
          path: '/spotify/albums',
          name: 'SpotifyAlbums',
          component: SpotifyAlbums,
        },
        {
          path: '/spotify/songs',
          name: 'SpotifySongs',
          component: SpotifySongs,
        },
        {
          path: '/spotify/search',
          name: 'SpotifySearch',
          component: SpotifySearch,
          children: [
            {
              path: '/spotify/search/albums/*',
              name: 'SpotifySearchAlbums',
              component: SpotifyAlbums,
              props: { search: true },
            },
            {
              path: '/spotify/search/songs/*',
              name: 'SpotifySearchSongs',
              component: SpotifySongs,
              props: { search: true },
            },
            {
              path: '/spotify/search/playlists/*',
              name: 'SpotifySearchPlaylists',
              component: SpotifyPlaylists,
              props: { search: true },
            },
          ],
        },
      ],
    },
    {
      path: '/spotify/playlist/*',
      name: 'SpotifyPlaylist',
      component: SpotifyAlbum,
      props: { isPlaylist: true },
    },
    {
      path: '/spotify/album/*',
      name: 'SpotifyAlbum',
      component: SpotifyAlbum,
    },
    {
      path: '/spotify/artist/*',
      name: 'SpotifyArtist',
      component: SpotifyArtist,
    },
    {
      path: '/soundcloud',
      component: Soundcloud,
      children: [
        {
          path: '',
          name: 'soundcloud',
          redirect: { name: 'SoundcloudStream' },
        },
        {
          path: '/soundcloud/stream',
          name: 'SoundcloudStream',
          component: SoundcloudStream,
        },
        {
          path: '/soundcloud/search',
          name: 'SoundcloudSearch',
          component: SoundcloudSearch,
          children: [
            {
              path: '/soundcloud/search/*',
              name: 'SoundcloudSearchSongs',
              component: SoundcloudStream,
              props: { search: true },
            },
          ],
        },
      ],
    },
    {
      path: '/soundcloud/playlist/*',
      name: 'SoundcloudPlaylist',
      component: SoundcloudPlaylist,
    },
    {
      path: '/soundcloud/related/*',
      name: 'SoundcloudRelated',
      component: SoundcloudPlaylist,
      props: { isRelated: true },
    },
    {
      path: '/soundcloud/user/*',
      name: 'SoundcloudUser',
      component: SoundcloudPlaylist,
      props: { isUser: true },
    },
  ],
});

router.beforeEach((to, from, next) => {
  store.commit('SET_PREVIOUS_ROUTE_PATH', from.path);
  next();
});

export default router;

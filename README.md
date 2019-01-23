# sonos-web
Sonos Web is a browser based controller for your [Sonos](https://www.sonos.com/system) sound system.

Install Sonos Web on a single computer and access and manage your system from any browser on your network.

![Search View](https://user-images.githubusercontent.com/5977736/51435364-fec86800-1c32-11e9-8ca0-a162b1dc1e91.png)


Sonos Web relies upon the [node-sonos](https://github.com/bencevans/node-sonos) project for all its Sonos communication.

Sonos Web has been tested on Windows 7, macOS, Linux, and Raspbian Stretch Lite (9.6).

[Check out the following Youtube video](https://youtu.be/0q8Z-XV81Z4) to see a brief demo of the system in use. (v0.5.2)

## Features
Sonos Web is a developing project and is not yet full-featured. Here are some of the currently available features:
 * Music Library
    * Search your entire music library with Top Results *
    * Browse, Queue, & Play your entire music library by category
    * View Artists, Genres & Playlists with Album Art! *
    * All artist & album names are links that take you to that item *
    * Browsing & searching is cached for quicker load times
 * Group rooms together via drag & drop *
 * Queue management via icon on Now Playing bar
 * Party mode (Group all speakers into one group)
 * Quickly & easily switch between rooms/groups
 * Adjust individual speaker volume/mute or adjust for the whole group 
 * Play, pause, skip, and seek tracks
 * Shuffle & repeat controls 
 * Room selection from the Now Playing bar.

 \* *Feature exclusive to Sonos Web (not available on official Sonos App)*
 

## Goals (Coming Soon)
 * Music Library
    * Sonos Playlists & Favorites
    * Other Music Services (ex. Pandora, Spotify, etc.) ...maybe? 
 * Recent Play History

## Install
The goal for this project is to make installation as simple as possible for Windows, Mac, & Linux.

To this end, **sonos-web-cli** was created to be able to install Sonos Web by a single command in your terminal.

If you do not already have npm installed, you must do so [here](https://www.npmjs.com/get-npm) before continuing.
If you are on Linux, the best way is to install node from source [here](https://github.com/nodesource/distributions)

Once npm is installed, run the following commands in your terminal to get started:
- `npm install -g sonos-web-cli`
- `sonos-web install` (Installs and starts Sonos Web)
- Open a browser to `http://localhost:5050` and enjoy!

Run `sonos-web --help` for more options

## Docker Support
### Raspberry Pi
Peter Toft (@pwt) is maintaining a [Docker image](https://hub.docker.com/r/psychlist/docker-sonos-web-arm) of sonos-web for later Raspberry Pi (ARMv7) systems.
[Click here](https://github.com/pwt/docker-sonos-web-arm) to get started.

### Windows & Mac
Unfortunately, Linux is the only supported OS for using Docker with sonos-web because of the need to use `network_mode: 'host'` for discovering the Sonos network. It seems that, at least for now, [only Linux machines](https://docs.docker.com/network/network-tutorial-host/#prerequisites) have proper support at this point for that feature.

> The host networking driver only works on Linux hosts, and is not supported on Docker for Mac, Docker for Windows, or Docker EE for Windows Server.


Check out these issues for more information:

https://github.com/docker/for-mac/issues/1031

https://github.com/docker/for-win/issues/937


## Screenshots

### Now Playing
![Now Playing](https://user-images.githubusercontent.com/5977736/50566780-999be980-0cfa-11e9-8085-d11eec234315.png)

### Queue Management
![Queue Management](https://user-images.githubusercontent.com/5977736/50566855-89d0d500-0cfb-11e9-8c7c-181a624b5eb7.png)

### Search View
![Search View 2](https://user-images.githubusercontent.com/5977736/51435372-4ea72f00-1c33-11e9-9cdc-b7adf47e9d86.png)

### Album Detail View
![Album View](https://user-images.githubusercontent.com/5977736/51081850-4b51f780-16b7-11e9-88a4-4466a9af640d.png)

### Playlists View
![Playlists View](https://user-images.githubusercontent.com/5977736/51081853-602e8b00-16b7-11e9-9944-91384dd74f17.png)

### Songs View
![Songs View](https://user-images.githubusercontent.com/5977736/51081854-60c72180-16b7-11e9-8197-8f2080ad253a.png)

### Genre Detail View
![Genre Detail View](https://user-images.githubusercontent.com/5977736/51081846-09c14c80-16b7-11e9-8fd8-a158d1a1b8f6.png)

### View all rooms and what they're playing
![Rooms](https://user-images.githubusercontent.com/5977736/50566842-5c842700-0cfb-11e9-8e7b-56a981769d26.png)

### Adjust volume as a group or as individual rooms
![Grouped Rooms & Individual Volume Adjustment](https://user-images.githubusercontent.com/5977736/50566804-fdbead80-0cfa-11e9-86c9-21290ff33288.png)


## Issues or Questions
If you have any issues or a questions feel free to [open an issue](https://github.com/Villarrealized/sonos-web/issues/new)

## Support
Suggestions and feedback are always welcome. 

If you like Sonos Web and would like to help fund further development of this project, you can do so through Beerpay.
[![Beerpay](https://beerpay.io/Villarrealized/sonos-web/badge.svg?style=beer)](https://beerpay.io/Villarrealized/sonos-web)

If there is a feature you would like to see developed you can also make a wish!
[![Beerpay](https://beerpay.io/Villarrealized/sonos-web/make-wish.svg?style=flat)](https://beerpay.io/Villarrealized/sonos-web)

## License
[GPL v3.0](https://github.com/Villarrealized/sonos-web-cli/blob/master/LICENSE)

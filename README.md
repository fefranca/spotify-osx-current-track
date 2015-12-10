Spotify OS X Current Track 
--------------------------

Noje.js project that gets the current playing track from Spotify (Mac OS X) and makes its data available through a WebSocket API. It also includes a web client interface to display the album art, song name and artist.

I use this at home to display the current track information using a portable projector, hopefully this can serve as a base for similar projects, party on! :)

This is also an example of:

* Obtaining track ID using AppleScript
* Fetching data from Spotify Web API
* Handling multiple exception scenarios
	* closed Spotify
	* token expiration
	* client / server individual crashes / reconnection
* Basic Handlebars.js usage for formatting track information

## Requirements

Only tested under the following system configuration, but most likely works on previous versions of Node.js and OS X.

* Spotify.app
* OS X 10.10+
* Node.js (4.1.3)

## Setup & Go

Setup node modules:

	npm install

Run server - this also opens up youur default browser and Spotify.app if it is closed:

	npm start


## License

This project is released under the MIT license.
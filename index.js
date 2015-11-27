var async = require('async');
var osascript = require('node-osascript');
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;
var request = require('request');
var chalk = require('chalk');
var open = require('open');

// Spotify credentials
// These are working client / secret ID from Spotify's examples:
// https://github.com/spotify/web-api-auth-examples
//
// For production use update to your own at 
// https://developer.spotify.com/my-applications

var SPOTIFY_CLIENT_ID = '03ffe0cac0a0401aa6673c3cf6d02ced';
var SPOTIFY_CLIENT_SECRET = 'a57c43efb9644574a96d6623fb8bfbc2';

server.listen(port, function () {
  console.log(chalk.cyan('Server listening at port %d'), port);
  console.log(chalk.cyan('Opening on default browser'));
  open('http://localhost:'+port);
});

// Routing
app.use(express.static(__dirname + '/public'));

// Basic server logic
io.on('connection', function (socket) {
  // Send current track immediately after user connects
  if(trackBody) {
    socket.emit('new track', trackBody);
  }

  // User requested track data
  socket.on('get track', function (username) {
    if(trackBody) {
      socket.emit('new track', trackBody);
    }
  });

  // User disconnected
  socket.on('disconnect', function () {

  });
});

// Spotify Web API - authorization
// https://developer.spotify.com/web-api/authorization-guide/
var spotifyAccessToken;
var trackID;
var trackBody;
var spotifyRunning = true;

var getAccessToken = function() {
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: {
      'Authorization': 'Basic ' + (new Buffer(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString('base64'))
    },
    form: {
      grant_type: 'client_credentials'
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      // save access token to access the Spotify Web API
      spotifyAccessToken = body.access_token;
      if(trackID) getTrackData(trackID);
    }
    else if(response) {
      console.log(chalk.red("status code"), response.statusCode);
    }
    else {
      console.log(chalk.red("Unable to renew Spotify Web API access token"), "("+error.code+")");
    }
  });

};

// Spotify Web API - get track information
// https://developer.spotify.com/web-api/get-track/
var getTrackData = function(trackID) {

  if(typeof spotifyAccessToken === 'undefined') {
    getAccessToken();
    return;
  }

  var options = {
    url: 'https://api.spotify.com/v1/tracks/'+trackID,
    headers: {
      'Authorization': 'Bearer ' + spotifyAccessToken
    },
    json: true
  };

  request.get(options, function(error, response, body) {

    if(response) {
      switch(response.statusCode) {
        case 200:
          trackBody = JSON.stringify(body);
          io.sockets.emit('new track', trackBody);
          break;
        case 401:
          console.log(chalk.cyan("renewing access token"));
          getAccessToken();
          break;
        default:
          console.log(chalk.red("Unable to fetch track data"), "(HTTP "+response.statusCode+")");
          break;
      }
    }
    else if(error) {
      console.log(chalk.red("Unable to fetch track data"), "("+error.code+")");
    }
  });
};

// Pool OS X Spotify every 500ms for track ID
async.forever(
  function(next) {
    osascript.executeFile('./get_spotify_track_id.scpt', null, function(error, result, raw){

      if (error) {
        if(spotifyRunning) {
          spotifyRunning = false;
          console.error(chalk.red("Unable to fetch current track - is Spotify open?"));
        }
        setTimeout(next, 1000);
        return;
      }
      spotifyRunning = true

      // Format track ID properly for API usage
      var currentTrackID = result.replace('spotify:track:', '');

      // Query API for information on new track
      if(trackID != currentTrackID) {
        trackID = currentTrackID;
        getTrackData(trackID);
        console.log(chalk.green("new track ID"), trackID);
      }
      setTimeout(next, 500);
    });
  },
  function(err){
    console.log(chalk.red("Error interrupted execution"), err); 
  }
);

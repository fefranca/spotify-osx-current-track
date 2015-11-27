$(function() {
  var connected = false;
  var socket = io();
  var trackTemplate = Handlebars.compile($("#track-template").html());

  // Update track using Handlebars template
  // Wait for album art to load before displaying information
  var updateTrack = function(params) {
    var img = new Image();
    img.onload = function() {
      $('#track-container').html(trackTemplate(params));
      img = null;
    }
    img.src = params.image;
  }

  // Parse new track information
  socket.on('new track', function (data) {
    var track = JSON.parse(data);
    var artists = [];

    for (var i = 0; i < track.artists.length; i++) {
      artists.push(track.artists[i].name);
    }

    var params =  {
      title: track.name,
      artist: artists.join(','),
      image: track.album.images[1].url
    };

    updateTrack(params);
  });

  // Just log connect / disconnect events
  // Socket.io handles reconnection automatically
  socket.on('connect', function (data) {
    console.log("connected to server");
  });

  socket.on('disconnect', function (data) {
    console.log("disconnected from server:", data);
  });

});

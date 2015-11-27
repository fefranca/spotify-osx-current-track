-- Get current track ID
-- https://developer.spotify.com/applescript-api/
tell application "Spotify"
  set currentID to id of current track
  return currentID
end tell

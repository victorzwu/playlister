import React from "react";
const spotifyWebApi = require("spotify-web-api-node");

export default function SpotifyLogin() {
  var scopes = ["user-read-private", "user-read-email"],
    redirectUri = "https://example.com/callback",
    clientId = process.env.SPOTIFY_CLIENT_ID;

  var spotifyApi = new spotifyWebApi({
    redirectUri: redirectUri,
    clientId: clientId,
  });

  var SPOTIFY_AUTH_URL = spotifyApi.createAuthorizeURL(scopes);

  return (
    <div>
      <a href={SPOTIFY_AUTH_URL}>Connect to Spotify</a>
    </div>
  );
}

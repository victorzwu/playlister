import React from "react";
import SpotifyWebApi from "spotify-web-api-node";
import "../style/css/login.css";
import logo from "../style/assets/greenspotify.png";

export default function SpotifyLogin() {
  var spotifyApi = new SpotifyWebApi({
    clientId: process.env.REACT_APP_SPOTIFY_CLIENT_ID,
    clientSecret: process.env.REACT_APP_SPOTIFY_CLIENT_SECRET,
    redirectUri: "http://localhost:3000/app/spotify/artists",
  });

  var scopes = [
    "user-read-private",
    "user-read-email",
    "playlist-read-private",
    "user-top-read",
  ];
  var state = "";

  var SPOTIFY_AUTH_URL = spotifyApi.createAuthorizeURL(scopes, state);

  return (
    <div class="container">
      <div>
        <h1>Spotify Login</h1>
      </div>
      <a href={SPOTIFY_AUTH_URL}>
        <div class="connect">
          <span class="connectspan">
            <img class="ispan" src={logo} alt="" />
          </span>
          Connect with Spotify
        </div>
      </a>
    </div>
  );
}

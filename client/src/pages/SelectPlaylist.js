import React from "react";
import { useState, useEffect } from "react";
import { useAuthToken } from "../contexts/Auth0Context";

export default function SelectPlaylist() {
  const [playlists, setPlaylists] = useState([]);

  const { accessToken } = useAuthToken();

  useEffect(() => {
    console.log("happened");
    async function getPlaylist() {
      const data = await fetch(
        `${process.env.REACT_APP_API_URL}/get-playlists`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const response = await data.json();
      console.log("getPlaylist()", response);
      setPlaylists(response);
    }

    if (accessToken) {
      getPlaylist();
      console.log("playlist: ", playlists);
    }
  }, [accessToken]);

  return (
    <div>
      Select Playlist
    </div>
  );
}

import React from "react";
import { useState, useEffect } from "react";
import { useAuthToken } from "../contexts/Auth0Context";
import { useSpotify } from "../contexts/SpotifyContext";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";


export default function Album() {

  const artistId = useParams().artistId;

  const [albums, setAlbums] = useState([]);

  const { accessToken } = useAuthToken();

  const { connected } = useSpotify();

  useEffect(() => {
    const getAlbums = async () => {
      const data = await fetch(`${process.env.REACT_APP_API_URL}/get-albums/${artistId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const response = await data.json();
      console.log("response: ", response);
      setAlbums(response);
    };
    if (accessToken && connected) {
      getAlbums();
    }
  }, [accessToken, connected, artistId]);

  return (
    <div>
    Pick an album from {artistId}
    <ul>
      {albums &&
        albums.map((x) => (
          <li key={x.id}>
            <Link to={"/app/spotify/albums/"+x.id}>{x.name}</Link>
          </li>
        ))}
    </ul>
  </div>
  )
}

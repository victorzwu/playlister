import React from "react";
import { useState, useEffect } from "react";
import { useAuthToken } from "../contexts/Auth0Context";
import { useSpotify } from "../contexts/SpotifyContext";
import { Link } from "react-router-dom";

export default function Ranked() {
  const [albums, setAlbums] = useState([]);

  const { accessToken } = useAuthToken();

  const { connected } = useSpotify();

  useEffect(() => {
    const getAlbums = async () => {
      const data = await fetch(
        `${process.env.REACT_APP_API_URL}/get-ranked-albums/`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const response = await data.json();
      console.log("response: ", response);
      setAlbums(response);
    };
    if (accessToken && connected) {
      getAlbums();
    }
  }, [accessToken, connected]);

  return (
    <div>
      {albums && (
        <ul className="artist-container">
          {albums.map((x) => (
            <li key={x.id}>
              <Link className="artist-link" to={"/app/spotify/ranked/" + x.id}>
                <div className="artist-card">
                  <img className="artist-image" src={x.image} alt="" />
                  {x.name}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

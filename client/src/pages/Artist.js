import React from "react";
import { useState, useEffect } from "react";
import { useAuthToken } from "../contexts/Auth0Context";
import { useSpotify } from "../contexts/SpotifyContext";
import { Link } from "react-router-dom";

export default function Artist() {
  const [artists, setArtists] = useState([]);

  const { accessToken } = useAuthToken();

  const { connected } = useSpotify();

  useEffect(() => {
    const getArtists = async () => {
      const data = await fetch(`${process.env.REACT_APP_API_URL}/get-artists`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const response = await data.json();
      console.log("response: ", response);
      setArtists(response);
    };
    if (accessToken && connected) {
      getArtists();
    }
  }, [accessToken, connected]);

  return (
    <div>
      Pick one of your favorite artists
      <ul>
        {artists &&
          artists.map((x) => (
            <li key={x.id}>
              <Link to={x.id}>{x.name}</Link>
            </li>
          ))}
      </ul>
    </div>
  );
}

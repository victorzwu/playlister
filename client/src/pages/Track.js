import React from "react";
import { useState, useEffect } from "react";
import { useAuthToken } from "../contexts/Auth0Context";
import { useSpotify } from "../contexts/SpotifyContext";
import { useParams } from "react-router-dom";

export default function Track() {
  const albumId = useParams().albumId;

  const [tracks, setTracks] = useState([]);

  const { accessToken } = useAuthToken();

  const { connected } = useSpotify();

  const [initialData, setInitialData] = useState(null);

  useEffect(() => {
    const getTracks = async () => {
      const data = await fetch(
        `${process.env.REACT_APP_API_URL}/get-tracks/${albumId}`,
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
      setTracks(response);
    };
    if (accessToken && connected) {
      getTracks();
    }
  }, [accessToken, connected, albumId]);

  useEffect(() => {
    if (tracks) {
      console.log("tracks", tracks);

      let obj = tracks.reduce((ac, a) => ({ ...ac, [a.id]: a }), {});

      const trackIds = tracks.map((p) => p.id);
      const newData = {
        trackItems: obj,
        columns: {
          column1: {
            id: "column1",
            title: "Track Ranking",
            trackIds: trackIds,
          },
        },
        columnOrder: ["column1"],
      };
      setInitialData(newData);
    }
  }, [tracks]);

  return (
    <div>
      Rank tracks from {albumId}
      <ul>{tracks && tracks.map((x) => <li key={x.id}>{x.name}</li>)}</ul>
    </div>
  );
}

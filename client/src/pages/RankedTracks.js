import React from "react";
import { useState, useEffect } from "react";
import { useAuthToken } from "../contexts/Auth0Context";
import { useParams } from "react-router-dom";
import { BsFillPlayCircleFill } from "react-icons/bs";
import "../style/css/format.css";

export default function RankedTracks() {
  const albumId = useParams().albumId;
  const [tracks, setTracks] = useState([]);

  const { accessToken } = useAuthToken();

  useEffect(() => {
    const getTracks = async () => {
      const data = await fetch(
        `${process.env.REACT_APP_API_URL}/get-ranked-tracks/${albumId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const response = await data.json();
    //   console.log("response: ", response);

      setTracks(
        response.sort((a, b) => {
          return a.rank - b.rank;
        })
      );
    };
    if (accessToken) {
      getTracks();
    }
  }, [accessToken, albumId]);

//   function playAudio(preview) {
//     let audio = new Audio(preview);
//     audio.play();
//   }

  return (
    <div>
      {tracks &&
        tracks.map((track, index) => {
          return (
            <div className="artist-card drag-card">
              {/* <button
                className="play-button"
                onClick={() => {
                  playAudio(track.preview);
                }}
              >
                <BsFillPlayCircleFill size="40" />
              </button> */}
              <div className="index-text">{index + 1}</div>
              <div className="name-text">{track.name}</div>
            </div>
          );
        })}
    </div>
  );
}

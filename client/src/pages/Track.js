import React from "react";
import { useState, useEffect, useRef } from "react";
import { useAuthToken } from "../contexts/Auth0Context";
import { useSpotify } from "../contexts/SpotifyContext";
import { useParams } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import html2canvas from "html2canvas";
import "../style/css/format.css";
import { BsFillPlayCircleFill } from "react-icons/bs";

export default function Track() {
  const albumId = useParams().albumId;

  const [tracks, setTracks] = useState([]);

  const { accessToken } = useAuthToken();

  const { connected } = useSpotify();

  // const [audioPlaying, setAudioPlaying] = useState(false);

  const printRef = useRef();

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

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(tracks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setTracks(items);
    console.log(items);
  };

  const handleDownloadImage = async () => {
    const element = printRef.current;
    const canvas = await html2canvas(element, {
      logging: true,
      letterRendering: 1,
      allowTaint: false,
      useCORS: true,
      width: 1080,
      height: 1920,
    });

    const data = canvas.toDataURL("image/jpg");
    const link = document.createElement("a");

    if (typeof link.download === "string") {
      link.href = data;
      link.download = "image.jpg";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      window.open(data);
    }
  };

  function playAudio(audio) {
    audio.play();
  }

  async function submit() {
    const data = await fetch(
      `${process.env.REACT_APP_API_URL}/rank-tracks/${albumId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(tracks),
      }
    );
    if (data.ok) {
      alert("Your ranking was uploaded succesffully.");
    }
  }

  return (
    <div>
      <div className="rank-btn-container">
        <h1>Rank your favorite tracks.</h1>

        <button className="btn-primary" onClick={handleDownloadImage}>
          Save Image
        </button>

        <button className="btn-primary" onClick={() => submit()}>
          Submit Ranking
        </button>
      </div>
      <div ref={printRef}>
        {tracks && (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId={albumId}>
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps}>
                  {tracks.map((track, index) => {
                    let audio = new Audio(track.preview_url);
                    console.log(track);
                    return (
                      <Draggable
                        key={track.id}
                        draggableId={track.id}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            ref={provided.innerRef}
                          >
                            <div className="artist-card drag-card">
                              <button
                                className="play-button"
                                onClick={() => {
                                  playAudio(audio);
                                }}
                              >
                                <BsFillPlayCircleFill size="40" />
                              </button>
                              <div className="index-text">{index + 1}</div>
                              <div className="name-text">{track.name}</div>
                              <div className="track-text">
                                track {track.track_number}
                              </div>
                              {track.artists.map((z) => (
                                <div>{z.name}</div>
                              ))}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>
    </div>
  );
}

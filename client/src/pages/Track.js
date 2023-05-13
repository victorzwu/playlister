import React from "react";
import { useState, useEffect, useRef } from "react";
import { useAuthToken } from "../contexts/Auth0Context";
import { useParams } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import html2canvas from "html2canvas";
import "../style/css/format.css";
import { BsFillPlayCircleFill, BsFillPauseCircleFill } from "react-icons/bs";
import { IoChevronBackCircleSharp } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import ReactModal from "react-modal";

export default function Track() {
  const albumId = useParams().albumId;

  const [tracks, setTracks] = useState([]);

  const { accessToken } = useAuthToken();

  const navigate = useNavigate();

  const [modalOpen, setModalOpen] = useState(false);

  const [isPlaying, setPlaying] = useState(false);
  const [currentSong, setCurrentSong] = useState(null);

  const audio = useRef(null);

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
      // console.log("response: ", response);
      setTracks(response);
    };
    if (accessToken) {
      getTracks();
    }
  }, [accessToken, albumId]);

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(tracks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setTracks(items);
    // console.log(items);
  };

  const handleDownloadImage = async () => {
    const element = printRef.current;
    const canvas = await html2canvas(element, {
      logging: true,
      letterRendering: 1,
      allowTaint: false,
      useCORS: true,
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

  const playAudio = (e) => {
    const song = e;
    if (currentSong === song) {
      isPlaying ? audio.current.pause() : audio.current.play();
      setPlaying(!isPlaying);
    } else {
      if (audio.current) {
        audio.current.pause();
      }

      setCurrentSong(song);
      setPlaying(true);
      audio.current = new Audio(song);
      audio.current.play();
    }
  };

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
      alert("Your ranking was uploaded successfully.");
    }
  }

  function PlayButton(props) {
    if (currentSong === props.url && isPlaying) {
      return <BsFillPauseCircleFill size="40" />;
    } else {
      return <BsFillPlayCircleFill size="40" />;
    }
  }

  function openModal() {
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
  }

  return (
    <div>
      <ReactModal
        style={{
          overlay: {
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(29, 185, 84, 0.75)",
          },
          content: {
            position: "absolute",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            border: "none",
            background: "black",
            maxHeight: "90%",
            maxWidth: "60%",
            WebkitOverflowScrolling: "touch",
            borderRadius: "0px",
            outline: "none",
            padding: "10px",
            margin: "auto",
          },
        }}
        isOpen={modalOpen}
      >
        <div className="download-image-section" ref={printRef}>
          <div className="save-title">ranked with rankify</div>
          <div className="save-container">
            {tracks &&
              tracks.map((track, index) => {
                return (
                  <div className="save-card">
                    <div className="index-text">{index + 1}</div>
                    <div className="name-text">{track.name}</div>
                  </div>
                );
              })}
          </div>
        </div>
        <button
          className="btn-primary ranked-btn"
          onClick={handleDownloadImage}
        >
          Save Image
        </button>
        <button className="btn-primary ranked-btn" onClick={closeModal}>
          X
        </button>
      </ReactModal>
      <div className="backdiv">
        <button className="backbutton" onClick={() => navigate(-1)}>
          <IoChevronBackCircleSharp size="30" />
        </button>
      </div>
      <div className="rank-btn-container">
        <h1 className="over-text">Rank your favorite tracks.</h1>
        <button className="btn-primary ranked-btn" onClick={openModal}>
          Create Instagram Story
        </button>
        <button className="btn-primary ranked-btn" onClick={() => submit()}>
          Submit Ranking
        </button>
      </div>
      <div>
        {tracks && (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId={albumId}>
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps}>
                  {tracks.map((track, index) => {
                    const audio = track.preview_url;
                    // console.log(track);
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
                                <PlayButton url={track.preview_url} />
                              </button>
                              <div className="index-text">{index + 1}</div>
                              <div className="name-text">{track.name}</div>
                              <div className="track-text">
                                track {track.track_number}
                              </div>
                              <div className="artist-text">
                                {track.artists.map((z) => (
                                  <div>{z.name}</div>
                                ))}
                              </div>
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

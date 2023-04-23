import React from "react";
import { useState, useEffect, useRef } from "react";
import { useAuthToken } from "../contexts/Auth0Context";
import { useSpotify } from "../contexts/SpotifyContext";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import "../style/css/format.css";
import html2canvas from "html2canvas";

export default function Album() {
  const artistId = useParams().artistId;

  const [albums, setAlbums] = useState([]);
  const [rank, setRank] = useState(false);

  const { accessToken } = useAuthToken();

  const { connected } = useSpotify();

  const printRef = useRef();

  useEffect(() => {
    const getAlbums = async () => {
      const data = await fetch(
        `${process.env.REACT_APP_API_URL}/get-albums/${artistId}`,
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
  }, [accessToken, connected, artistId]);

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(albums);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setAlbums(items);
    console.log(items);
  };

  const handleDownloadImage = async () => {
    const element = printRef.current;
    const canvas = await html2canvas(element);

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

  function rankAlbums() {
    setRank(!rank);
  }

  return (
    <div>
      <div className="rank-btn-container">
        <h1> Choose an album or rank them.</h1>
        <button className="btn-primary" onClick={() => rankAlbums()}>
          {!rank && "Rank Albums"}
          {rank && "Stop Ranking"}
        </button>
        {rank && (
          <button className="btn-primary" onClick={handleDownloadImage}>
            Save Image
          </button>
        )}
      </div>
      <ul className="artist-container">
        {albums &&
          !rank &&
          albums.map((x) => (
            <li key={x.id}>
              <Link className="artist-link" to={"/app/spotify/albums/" + x.id}>
                <div className="artist-card">
                  <img className="artist-image" src={x.image} alt="" />
                  {x.name}
                </div>
              </Link>
            </li>
          ))}
      </ul>
      <div ref={printRef}>
        {albums && rank && (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId={artistId}>
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps}>
                  {albums.map((album, index) => (
                    <Draggable
                      key={album.id}
                      draggableId={album.id}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          ref={provided.innerRef}
                        >
                          <div className="artist-card drag-card">
                            <div className="index-text">{index + 1}</div>
                            <img className="artist-image" src={album.image} />
                            <div className="name-text">{album.name}</div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
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

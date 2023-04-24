import React from "react";
import { useState, useEffect, useRef } from "react";
import { useAuthToken } from "../contexts/Auth0Context";
import { useSpotify } from "../contexts/SpotifyContext";
import { Link } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import "../style/css/format.css";
import html2canvas from "html2canvas";
import { IoChevronBackCircleSharp } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

export default function Artist() {
  const [artists, setArtists] = useState([]);
  const [rank, setRank] = useState(false);

  const { accessToken } = useAuthToken();

  const { connected } = useSpotify();

  const printRef = useRef();

  const navigate = useNavigate();

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

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(artists);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setArtists(items);
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

  function rankArtists() {
    setRank(!rank);
  }


  return (
    <div>
      <div className="backdiv">
        <button className="backbutton" onClick={()=>navigate(-1)}>
          <IoChevronBackCircleSharp size="30" />
        </button>
      </div>
      <div className="rank-btn-container">
        <h1 className="over-text"> Choose one of your favorite artists or rank them.</h1>

        <button className="btn-primary ranked-btn" onClick={() => rankArtists()}>
          {!rank && "Rank Artists"}
          {rank && "Stop Ranking"}
        </button>

        {rank && (
          <button className="btn-primary ranked-btn" onClick={handleDownloadImage}>
            Save Image
          </button>
        )}
      </div>
      <div>
        <ul className="artist-container">
          {artists &&
            !rank &&
            artists.map((x) => (
              <li key={x.id}>
                <Link className="artist-link" to={x.id}>
                  <div className="artist-card">
                    <img className="artist-image" src={x.image} alt="artist" />
                    {x.name}
                  </div>
                </Link>
              </li>
            ))}
        </ul>
      </div>
      <div ref={printRef}>
        {artists && rank && (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId={"artists"}>
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps}>
                  {artists.map((artist, index) => (
                    <Draggable
                      key={artist.id}
                      draggableId={artist.id}
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
                            <img
                              className="artist-image"
                              alt="artist"
                              src={artist.image}
                            />
                            <div className="name-text">{artist.name}</div>
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

import React from "react";
import { useState, useEffect } from "react";
import { useAuthToken } from "../contexts/Auth0Context";
import { useSpotify } from "../contexts/SpotifyContext";
import { Link } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import "../style/css/artist.css";

export default function Artist() {
  const [artists, setArtists] = useState([]);
  const [rank, setRank] = useState(false);

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

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(artists);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setArtists(items);
    console.log(items);
  };

  function rankArtists() {
    setRank(!rank);
  }

  return (
    <div>
      <div className="artist-container">
        Pick one of your favorite artists
        <ul>
          {artists &&
            !rank &&
            artists.map((x) => (
              <li key={x.id}>
                <Link className="artist-card" to={x.id}>
                  <img className="artist-image" src={x.image} alt="" />
                  {x.name}
                </Link>
              </li>
            ))}
        </ul>
      </div>
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
                        <div>{artist.name}</div>
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
      <button onClick={() => rankArtists()}>
        {!rank && "Rank Artists"}
        {rank && "Stop Ranking"}
      </button>
    </div>
  );
}

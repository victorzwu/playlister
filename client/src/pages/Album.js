import React from "react";
import { useState, useEffect } from "react";
import { useAuthToken } from "../contexts/Auth0Context";
import { useSpotify } from "../contexts/SpotifyContext";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

export default function Album() {
  const artistId = useParams().artistId;

  const [albums, setAlbums] = useState([]);
  const [rank, setRank] = useState(false);

  const { accessToken } = useAuthToken();

  const { connected } = useSpotify();

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

  function rankAlbums() {
    setRank(!rank);
  }

  return (
    <div>
      Pick an album from {artistId}
      <ul>
        {albums &&
          !rank &&
          albums.map((x) => (
            <li key={x.id}>
              <Link to={"/app/spotify/albums/" + x.id}>{x.name}</Link>
            </li>
          ))}
      </ul>
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
                        <div>{album.name}</div>
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
      <button onClick={() => rankAlbums()}>
        {!rank && "Rank Artists"}
        {rank && "Stop Ranking"}
      </button>
    </div>
  );
}

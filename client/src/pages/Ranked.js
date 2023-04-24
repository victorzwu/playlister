import React from "react";
import { useState, useEffect } from "react";
import { useAuthToken } from "../contexts/Auth0Context";
import { Link } from "react-router-dom";
import "../style/css/format.css";

export default function Ranked() {
  const [albums, setAlbums] = useState([]);

  const [deleted, setDeleted] = useState(false);

  const { accessToken } = useAuthToken();

  useEffect(() => {
    const getAlbums = async () => {
      const data = await fetch(
        `${process.env.REACT_APP_API_URL}/get-ranked-albums`,
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
      setAlbums(response);
    };
    if (accessToken) {
      getAlbums();
    }
  }, [accessToken, deleted]);

  const deleteAlbum = async (id) => {
    const data = await fetch(
      `${process.env.REACT_APP_API_URL}/delete-rank/${id}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    const response = await data.json();

    setDeleted(!deleted);
  };

  return (
    <div>
      {albums && (
        <ul className="artist-container extra-container">
          {albums.map((x) => (
            <li key={x.id}>
              <div className="ranked-card">
                <Link
                  className="artist-link"
                  to={"/app/spotify/rankedalbums/" + x.id}
                >
                  <div className="artist-card extra-card">
                    <img className="artist-image" src={x.image} alt="" />
                    {x.name}
                  </div>
                </Link>
                <div
                  className="deletebutton"
                  onClick={() => deleteAlbum(x.id)}
                >
                  x
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

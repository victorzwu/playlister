import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
import "../style/css/profile.css";
import { useAuthToken } from "../contexts/Auth0Context";

export default function Profile() {
  const { user } = useAuth0();

  const [artists, setArtists] = useState([]);

  const { accessToken } = useAuthToken();

  const [dbUser, setDbUser] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const data = await fetch(`${process.env.REACT_APP_API_URL}/me`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const response = await data.json();

      setDbUser(response);
    };

    const getArtists = async () => {
      const data = await fetch(`${process.env.REACT_APP_API_URL}/get-artists`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const response = await data.json();
      // console.log("response: ", response);

      setArtists(response);
    };
    if (accessToken) {
      getUser();
      getArtists();
    }
  }, [accessToken]);

  return (
    <div className="profile-container">
      <div className="profile-card">
        {dbUser && (
          <div className="user-picture">
            <img src={dbUser.picture} width="150" alt="profile avatar" />
          </div>
        )}
        <div className="normal">
          <p className="normal-Text">Nickname: {user.nickname}</p>
        </div>
        <div className="normal">
          <p className="normal-Text">Email: {user.email}</p>
        </div>
        <p className="normal-Text">My Top Artists: </p>
        {artists &&
          artists.map((x) => (
            <li className="normal">
                <div className="normal-Text">
                  {x.name}
                </div>
            </li>
          ))}

      </div>
    </div>
  );
}

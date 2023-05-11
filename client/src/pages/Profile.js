import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
import "../style/css/profile.css";
import { useAuthToken } from "../contexts/Auth0Context";

export default function Profile() {
  const { user } = useAuth0();

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
    if (accessToken) {
      getUser();
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
        <div className="normal">
          <p className="normal-Text">Auth0Id: {user.sub}</p>
        </div>
        <div className="normal">
          <p className="normal-Text">
            Email verified: {user.email_verified?.toString()}
          </p>
        </div>
      </div>
    </div>
  );
}

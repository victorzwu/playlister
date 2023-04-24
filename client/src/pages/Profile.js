import { useAuth0 } from "@auth0/auth0-react";
import { useEffect } from "react";
import "../style/css/profile.css";
// import { useAuthToken } from "../contexts/Auth0Context";


export default function Profile() {
  const { user } = useAuth0();

  console.log(user);

  useEffect(() => {}, []);

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="user-picture">
          <img src={user.picture} width="150" alt="profile avatar" />
        </div>
        <div>
          <p className="normal-Text">Nickname: {user.nickname}</p>
        </div>
        <div>
          <p className="normal-Text">Email: {user.email}</p>
        </div>
        <div>
          <p className="normal-Text">Auth0Id: {user.sub}</p>
        </div>
        <div>
          <p className="normal-Text">
            Email verified: {user.email_verified?.toString()}
          </p>
        </div>
      </div>
    </div>
  );
}

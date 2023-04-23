import "../style/css/appLayout.css";
import logo from "../style/assets/whitespotify.png";
import { Outlet, Link } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

import { BsPersonCircle } from "react-icons/bs";
import { BiHomeAlt2 } from "react-icons/bi";

export default function AppLayout() {
  const { user, isLoading, logout } = useAuth0();

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="applayout">
      <div className="header">
        <div class="applogo">
          <img className="logo" alt="logo" src={logo} />
          <h1>rankify</h1>
        </div>
        <nav className="menu">
          <ul className="menu-list">
            <li>
              <Link to="/app/">
                {" "}
                <BiHomeAlt2 /> Home{" "}
              </Link>
            </li>
            <li>
              <Link to="/app/profile">
                <BsPersonCircle /> Profile
              </Link>
            </li>
          </ul>
        </nav>
        <div>Welcome 👋 {user.name} </div>
        <button
          className="exit-button"
          onClick={() => logout({ returnTo: window.location.origin })}
        >
          LogOut
        </button>
      </div>

      <div className="content">
        <Outlet />
      </div>
    </div>
  );
}

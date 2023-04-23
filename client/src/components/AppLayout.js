import "../style/css/appLayout.css";
import logo from "../style/assets/whitespotify.png";
import { Outlet, Link } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

import { BsPerson } from "react-icons/bs";
import { BiHomeAlt2 } from "react-icons/bi";
import { MdAlbum } from "react-icons/md";


export default function AppLayout() {
  const { user, isLoading, logout } = useAuth0();

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="applayout">
      <div className="header">
        <div className="applogo">
          <img className="logo" alt="logo" src={logo} />
          <h1>rankify</h1>
        </div>
        <div id="email">{user.name}</div>
        <nav className="menu">
          <ul className="menu-list">
            <li>
              <Link className="btn-primary menu-button" to="/app/">
                <BiHomeAlt2 /> Home
              </Link>
            </li>
            <li>
              <Link
                className="btn-primary menu-button"
                to="/app/spotify/rankedalbums"
              >
                <MdAlbum /> Ranked Albums
              </Link>
            </li>
            <li>
              <Link className="btn-primary menu-button" to="/app/profile">
                <BsPerson /> Profile
              </Link>
            </li>
            <li>
              <button
                className="btn-secondary logout-button"
                onClick={() => logout({ returnTo: window.location.origin })}
              >
                Log Out
              </button>
            </li>
          </ul>
        </nav>
      </div>

      <div className="content">
        <Outlet />
      </div>
    </div>
  );
}

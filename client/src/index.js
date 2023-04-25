import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";
import { Auth0TokenProvider } from "./contexts/Auth0Context";
import Profile from "./pages/Profile";
import VerifyUser from "./pages/VerifyUser";
import AppLayout from "./components/AppLayout";
import Error from "./pages/Error";
import SpotifyLogin from "./pages/SpotifyLogin";
import Artist from "./pages/Artist";
import Album from "./pages/Album";
import Track from "./pages/Track";
import { SpotifyProvider } from "./contexts/SpotifyContext";
import Ranked from "./pages/Ranked";
import RankedTracks from "./pages/RankedTracks";

const root = ReactDOM.createRoot(document.getElementById("root"));

const requestedScopes = [
  "profile",
  "email",
  "write:user",
  "read:user",
  "update:user",
  "delete:user",
  "write:album",
  "read:album",
  "update:album",
  "delete:album",
  "write:artist",
  "read:artist",
  "update:artist",
  "delete:artist",
  "write:track",
  "read:track",
  "update:track",
  "delete:track",
];

function RequireAuth0({ children }) {
  const { isAuthenticated, isLoading } = useAuth0();

  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}

// function RequireSpotifyAuth({ children }) {
//   const { isAuthenticated, isLoading } = useAuth0();
//   if (!isLoading && !isAuthenticated) {
//     return <Navigate to="/" replace />;
//   }
//   return children;
// }

root.render(
  <React.StrictMode>
    <Auth0Provider
      domain={process.env.REACT_APP_AUTH0_DOMAIN}
      clientId={process.env.REACT_APP_AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: `${process.env.REACT_APP_ORIGIN}/verify-user`,
        audience: process.env.REACT_APP_AUTH0_AUDIENCE,
        scope: requestedScopes.join(" "),
      }}
    >
      <Auth0TokenProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="verify-user" element={<VerifyUser />} />
            <Route
              path="app"
              element={
                <RequireAuth0>
                  <AppLayout />
                </RequireAuth0>
              }
            >
              <Route path="profile" element={<Profile />} />
              <Route index element={<SpotifyLogin />} />
              <Route
                path="spotify"
                element={
                  <SpotifyProvider>
                    <Outlet />
                  </SpotifyProvider>
                }
              >
                <Route exact path="artists" element={<Artist />} />
                <Route path="artists/:artistId" element={<Album />} />
                <Route path="albums/:albumId" element={<Track />} />
                <Route exact path="rankedalbums" element={<Ranked />} />
                <Route path="rankedalbums/:albumId" element={<RankedTracks />} />
              </Route>
            </Route>
            <Route path="*" element={<Error />} />
          </Routes>
        </BrowserRouter>
      </Auth0TokenProvider>
    </Auth0Provider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

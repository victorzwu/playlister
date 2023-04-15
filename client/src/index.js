import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";
import { Auth0TokenProvider } from "./contexts/Auth0Context";
import Profile from "./pages/Profile";
import VerifyUser from "./pages/VerifyUser";
import AppLayout from "./AppLayout";
import Error from "./pages/Error";
import SpotifyLogin from "./pages/SpotifyLogin";
import SelectPlaylist from "./pages/SelectPlaylist";
import SpotifyProvider from "./contexts/SpotifyContext";

const root = ReactDOM.createRoot(document.getElementById("root"));

const requestedScopes = ["profile", "email"];

function RequireAuth0({ children }) {
  const { isAuthenticated, isLoading } = useAuth0();

  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function RequireSpotifyAuth({ children }) {
  // const { isAuthenticated, isLoading } = useAuth0();
  // if (!isLoading && !isAuthenticated) {
  //   return <Navigate to="/" replace />;
  // }
  // return children;
}

root.render(
  <React.StrictMode>
    <Auth0Provider
      domain={process.env.REACT_APP_AUTH0_DOMAIN}
      clientId={process.env.REACT_APP_AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: `${window.location.origin}/verify-user`,
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
              <Route index element={<Profile />} />
              <Route path="spotifylogin" element={<SpotifyLogin />} />
              <Route
                path="spotify"
                element={<SpotifyProvider></SpotifyProvider>}
              >
                <Route path="/" element={<SelectPlaylist />} />
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

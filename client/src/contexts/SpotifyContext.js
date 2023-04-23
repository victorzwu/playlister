import React from "react";
import { useAuthToken } from "./Auth0Context";
import { createContext, useContext } from "react";
import useAuthSpotify from "../hooks/useAuthSpotify";

const SpotifyContext = createContext();

const code = new URLSearchParams(window.location.search).get("code");

function SpotifyProvider({ children }) {
  const { accessToken } = useAuthToken();
  const { connected } = useAuthSpotify(accessToken, code);
  console.log("connected in provider", connected);

  return (
    <SpotifyContext.Provider value={{ connected: connected }}>
      {children}
    </SpotifyContext.Provider>
  );
}

const useSpotify = () => useContext(SpotifyContext);


export {SpotifyProvider, useSpotify};

import React, { useContext, useState, useEffect } from "react";

const SpotifyContext = React.createContext();

const code = new URLSearchParams(window.location.search).get("code");

export function useAccess({ code }) {
  const [accessToken, setAccessToken] = useState("");
}

function SpotifyProvider({ children }) {
  const { accessToken, connecting, SignOut, error, setError, tokenExpired } =
    useAccess(code);

  console.log(code);
  return <SpotifyContext.Provider></SpotifyContext.Provider>;
}

export default SpotifyProvider;

import React, { useState, useEffect } from "react";
import { useAuthToken } from "./Auth0Context";

const SpotifyContext = React.createContext();

const code = new URLSearchParams(window.location.search).get("code");

export function useAuthSpotify(code, accessToken) {
  const [spotifyToken, setSpotifyToken] = useState(null);


  // console.log("access token: ", accessToken);

  useEffect(() => {
    if (!code || !accessToken) {
      return;
    } else {
      async function authenticate(code) {
        const data = await fetch(`${process.env.REACT_APP_API_URL}/spotifytoken`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            code: code,
          }),
        });
        console.log("data: ", data);

        if (data.ok) {
          const response = await data.json();
          console.log("response: ", response);
          return response;
        } else {
          console.log("failed");
          return null;
        }
      }
      setSpotifyToken(authenticate(code));
      console.log("spotify token: ", spotifyToken);
    }
  }, [accessToken]);

  return { spotifyToken };
}

function SpotifyProvider({ children }) {
  // const { accessToken, connecting, SignOut, error, setError, tokenExpired } =
  //   useAuthSpotify(code);
  const { accessToken } = useAuthToken();
  const { spotifyToken } = useAuthSpotify(code, accessToken);

  // console.log("spotify token ", spotifyToken)

  // console.log("token in provider", spotifyToken);

  // const check = code;
  // const value = { check };
  // console.log(code);
  return (
    <SpotifyContext.Provider value={spotifyToken}>
      {children}
    </SpotifyContext.Provider>
  );
}

export default SpotifyProvider;

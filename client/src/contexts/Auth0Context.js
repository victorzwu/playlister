import React, { useContext, useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";

const Auth0Context = React.createContext();

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

function Auth0TokenProvider({ children }) {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  const [accessToken, setAccessToken] = useState();

  useEffect(() => {
    const getAccessToken = async () => {
      try {
        const token = await getAccessTokenSilently({
          authorizationParams: {
            audience: process.env.REACT_APP_AUTH0_AUDIENCE,
            scope: requestedScopes.join(" "),
          },
        });
        setAccessToken(token);
      } catch (err) {
        console.log(err);
      }
    };

    if (isAuthenticated) {
      getAccessToken();
    }
  }, [getAccessTokenSilently, isAuthenticated]);

  const value = { accessToken, setAccessToken };
  return (
    <Auth0Context.Provider value={value}>{children}</Auth0Context.Provider>
  );
}

const useAuthToken = () => useContext(Auth0Context);

export { useAuthToken, Auth0TokenProvider };

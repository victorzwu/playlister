import { useState, useEffect } from "react";

export default function useAuthSpotify(accessToken, code) {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const authenticate = async (code) => {
      try {
        const data = await fetch(
          `${process.env.REACT_APP_API_URL}/spotifytoken`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              code: code,
            }),
          }
        );
        console.log(data);
        if (data) {
          setConnected(true);
        } else {
          setConnected(false);
        }
      } catch (e) {
        console.log(e);
      }
    };

    if (!code || !accessToken || connected) {
      return;
    } else {
      authenticate(code);
    }
  }, [accessToken, connected, code]);

  return { connected };
}

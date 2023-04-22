import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import pkg from "@prisma/client";
import morgan from "morgan";
import cors from "cors";
import { auth } from "express-oauth2-jwt-bearer";
import SpotifyWebApi from "spotify-web-api-node";

const requireAuth = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER,
  tokenSigningAlg: "RS256",
});

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan("dev"));

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

// const scopes = ["user-read-private", "user-read-email"];
// const redirectUri = "https://example.com/callback";
// const clientId = "5fe01282e44241328a84e7c5cc169165";
// const state = "some-state-of-my-choice";

// get Profile information of authenticated user
app.get("/me", requireAuth, async (req, res) => {
  const auth0Id = req.auth.payload.sub;

  const user = await prisma.user.findUnique({
    where: {
      auth0Id,
    },
  });

  res.json(user);
});

// verify user status, if not registered in our database we will create it
app.post("/verify-user", requireAuth, async (req, res) => {
  const auth0Id = req.auth.payload.sub;
  const email = req.auth.payload[`${process.env.AUTH0_AUDIENCE}/email`];
  const name = req.auth.payload[`${process.env.AUTH0_AUDIENCE}/name`];

  const user = await prisma.user.findUnique({
    where: {
      auth0Id,
    },
  });

  if (user) {
    res.json(user);
  } else {
    const newUser = await prisma.user.create({
      data: {
        email,
        auth0Id,
        name,
        playlists: {},
      },
    });

    res.json(newUser);
  }
});

app.put("/spotifytoken", requireAuth, async (req, res) => {
  const code = req.body.code;

  const auth0Id = req.auth.payload.sub;

  console.log("code in server: ", code);
  console.log("auth0Id in server: ", auth0Id);

  var spotifyApi = new SpotifyWebApi({
    clientId: process.env.REACT_APP_SPOTIFY_CLIENT_ID,
    clientSecret: process.env.REACT_APP_SPOTIFY_CLIENT_SECRET,
    redirectUri: "http://localhost:3000/app/spotify/",
  });

  spotifyApi
    .authorizationCodeGrant(code)
    .then(
      async function (data) {
        console.log("The token expires in " + data.body["expires_in"]);
        console.log("The access token is " + data.body["access_token"]);
        console.log("The refresh token is " + data.body["refresh_token"]);

        // const user = await prisma.user.findUnique({
        //   where: {
        //     auth0Id,
        //   },
        // });

        // if (
        //   !user.accessToken ||
        //   !user.refreshToken ||
        //   Date.now().getTime() >= user.tokenTime.getTime() + 3600
        // ) {

        const newUser = await prisma.user.update({
          where: {
            auth0Id: auth0Id,
          },
          data: {
            accessToken: data.body["access_token"],
            refreshToken: data.body["refresh_token"],
            displayName: data.body["display_name"],
          },
        });

        spotifyApi.setAccessToken(data.body["access_token"]);
        spotifyApi.setRefreshToken(data.body["refresh_token"]);

        spotifyApi.getMyTopArtists().then(
          function (data) {
            const artists = data.body;

            artists.items.map(async (x) => {
              const newArtists = await prisma.artist
                .upsert({
                  where: {
                    id: parseInt(x.id),
                  },
                  update: {
                    name: x.name,
                    owner: { connect: { auth0Id } },
                  },
                  create: {
                    id: parseInt(x.id),
                    albums: {},
                    name: x.name,
                    owner: { connect: { auth0Id } },
                  },
                })
                .catch((e) => console.log("artists create error:", e));

                spotifyApi.getPlaylistTracks(x.id).then(
                  function (track) {
                    track.body.items.map(async (y) => {
                      if (y.track.id && y.track.name && y.track.href) {
                        const newTrack = await prisma.track.upsert({
                          where: {
                            id: y.track.id,
                          },
                          update: {
                            name: y.track.name,
                            preview: y.track.href,
                            playlistId: parseInt(x.id),
                          },
                          create: {
                            id: y.track.id,
                            name: y.track.name,
                            preview: y.track.href,
                            playlistId: parseInt(x.id),
                          },
                        });
                      }
                    });
                  },
                  function (err) {
                    console.log("track create", err);
                  }
                );

            console.log(data.body);
          },
          function (err) {
            console.log("Something went wrong!", err);
            
          }
        );

        res.json(newUser);
        })
    .catch((e) => {
      console.log("Something went wrong!", e);
      res.sendStatus(400);
    });
});

app.get("/get-playlists", requireAuth, async (req, res) => {
  const auth0Id = req.auth.payload.sub;

  const user = await prisma.user.findUnique({
    where: {
      auth0Id,
    },
  });

  const playlists = await prisma.playlist.findMany({
    where: {
      authorId: user.id,
    },
  });

  res.json(playlists);
});

app.listen(8000, () => {
  console.log("Server running on http://localhost:8000 🎉 🚀");
});

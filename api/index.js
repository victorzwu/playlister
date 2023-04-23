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
        artists: {},
      },
    });

    res.json(newUser);
  }
});

app.put("/spotifytoken", requireAuth, async (req, res) => {
  const code = req.body.code;

  const auth0Id = req.auth.payload.sub;

  var spotifyApi = new SpotifyWebApi({
    clientId: process.env.REACT_APP_SPOTIFY_CLIENT_ID,
    clientSecret: process.env.REACT_APP_SPOTIFY_CLIENT_SECRET,
    redirectUri: "http://localhost:3000/app/spotify/artists",
  });

  spotifyApi
    .authorizationCodeGrant(code)
    .then(async function (data) {
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
          artists.items.map(
            async (x) => {
              const newArtists = await prisma.artist
                .upsert({
                  where: {
                    id: x.id,
                  },
                  update: {
                    name: x.name,
                    owner: { connect: { auth0Id } },
                    image: x.images[0].url,
                  },
                  create: {
                    id: x.id,
                    albums: {},
                    name: x.name,
                    owner: { connect: { auth0Id } },
                    image: x.images[0].url,
                  },
                })
                .catch((e) => console.log("artists create error:", e));

              spotifyApi.getArtistAlbums(x.id).then(function (album) {
                album.body.items.map(
                  async (y) => {
                    if (y.id && y.name) {
                      const newAlbum = await prisma.album.upsert({
                        where: {
                          id: y.id,
                        },
                        update: {
                          name: y.name,
                          artistId: x.id,
                          image: y.images[0].url
                        },
                        create: {
                          id: y.id,
                          name: y.name,
                          artistId: x.id,
                          tracks: {},
                          image: y.images[0].url
                        },
                      });
                    }
                  },
                  function (err) {
                    console.log("album create ", err);
                  }
                );
              });
            },
            function (err) {
              console.log("artist create", err);
            }
          );
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

app.get("/get-artists", requireAuth, async (req, res) => {
  const auth0Id = req.auth.payload.sub;

  const user = await prisma.user.findUnique({
    where: {
      auth0Id,
    },
  });

  try {
    const artists = await prisma.artist.findMany({
      where: { authorId: user.id },
    });
    res.json(artists);
  } catch (e) {
    console.log("artist await, ", e);
  }
});

app.get("/get-albums/:artistId", requireAuth, async (req, res) => {
  // const auth0Id = req.auth.payload.sub;
  const artistId = req.params.artistId;

  const artist = await prisma.artist.findUnique({
    where: {
      id: artistId,
    },
  });

  try {
    const albums = await prisma.album.findMany({
      where: { artistId: artist.id },
    });
    res.json(albums);
  } catch (e) {
    console.log("album await, ", e);
  }
});

app.get("/get-tracks/:albumId", requireAuth, async (req, res) => {
  const auth0Id = req.auth.payload.sub;

  const albumId = req.params.albumId;

  const user = await prisma.user.findUnique({
    where: {
      auth0Id,
    },
  });

  var spotifyApi = new SpotifyWebApi({
    clientId: process.env.REACT_APP_SPOTIFY_CLIENT_ID,
    clientSecret: process.env.REACT_APP_SPOTIFY_CLIENT_SECRET,
    redirectUri: "http://localhost:3000/app/spotify/artists",
  });

  spotifyApi.setAccessToken(user.accessToken);
  spotifyApi.setRefreshToken(user.refreshToken);

  spotifyApi.getAlbumTracks(albumId).then(
    function (track) {
      const response = track.body.items;
      res.json(response);
    },
    function (err) {
      console.log("track create", err);
    }
  );
});

app.listen(8000, () => {
  console.log("Server running on http://localhost:8000 🎉 🚀");
});

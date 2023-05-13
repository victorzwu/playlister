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

app.use(
  cors({
      origin: "*"
  }
));
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

app.get("/ping", (req, res) => {
  res.send("pong");
});

// verify user status, if not registered in our database we will create it
app.post("/verify-user", requireAuth, async (req, res) => {
  const auth0Id = req.auth.payload.sub;
  const email = req.auth.payload[`${process.env.AUTH0_AUDIENCE}/email`];
  const name = req.auth.payload[`${process.env.AUTH0_AUDIENCE}/name`];
  let picture = "";
  if (req.auth.payload[`${process.env.AUTH0_AUDIENCE}/images`]) {
    picture = req.auth.payload[`${process.env.AUTH0_AUDIENCE}/images`];
  }

  const user = await prisma.user.upsert({
    where: {
      auth0Id,
    },
    update: {
      name,
      picture,
    },
    create: {
      email,
      auth0Id,
      name,
      picture,
      artists: {},
      albums: {},
      tracks: {},
    },
  });
  res.json(user);
});

app.put("/spotifytoken", requireAuth, async (req, res) => {
  const code = req.body.code;

  const auth0Id = req.auth.payload.sub;

  var spotifyApi = new SpotifyWebApi({
    clientId: process.env.REACT_APP_SPOTIFY_CLIENT_ID,
    clientSecret: process.env.REACT_APP_SPOTIFY_CLIENT_SECRET,
    redirectUri: process.env.REACT_APP_REDIRECT_URL,
  });

  const user = await prisma.user.findUnique({
    where: {
      auth0Id,
    },
  });

  if (user.tokenTime && Date.now() < user.tokenTime.getTime() + 3600) {
    res.json("success");
  } else {
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

        res.json("refreshed");
      })
      .catch((e) => {
        console.log("Something went wrong!", e);
        res.sendStatus(400);
      });
  }
});

app.get("/get-artists", requireAuth, async (req, res) => {
  const auth0Id = req.auth.payload.sub;

  var spotifyApi = new SpotifyWebApi({
    clientId: process.env.REACT_APP_SPOTIFY_CLIENT_ID,
    clientSecret: process.env.REACT_APP_SPOTIFY_CLIENT_SECRET,
    redirectUri: process.env.REACT_APP_REDIRECT_URL,
  });

  const user = await prisma.user.findUnique({
    where: {
      auth0Id,
    },
  });

  spotifyApi.setAccessToken(user.accessToken);
  spotifyApi.setRefreshToken(user.refreshToken);

  let artistsArray = [];

  try {
    const check = await spotifyApi.getMyTopArtists().then(function (data) {
      const artists = data.body;

      artists.items.map(async (x) => {
        artistsArray = [
          ...artistsArray,
          {
            id: x.id,
            albums: {},
            name: x.name,
            owner: { connect: { auth0Id } },
            image: x.images[0].url,
          },
        ];
      });
    });

    res.json(artistsArray);
  } catch (e) {
    console.log("getArtist error: ", e);
  }
});

/**
 * Fix
 */
app.get("/get-albums/:artistId", requireAuth, async (req, res) => {
  const auth0Id = req.auth.payload.sub;

  var spotifyApi = new SpotifyWebApi({
    clientId: process.env.REACT_APP_SPOTIFY_CLIENT_ID,
    clientSecret: process.env.REACT_APP_SPOTIFY_CLIENT_SECRET,
    redirectUri: process.env.REACT_APP_REDIRECT_URL,
  });

  const user = await prisma.user.findUnique({
    where: {
      auth0Id,
    },
  });

  spotifyApi.setAccessToken(user.accessToken);
  spotifyApi.setRefreshToken(user.refreshToken);

  const artistId = req.params.artistId;

  let albumsArray = [];

  const check = await spotifyApi
    .getArtistAlbums(artistId)
    .then(function (data) {
      const albums = data.body;

      albums.items.map(async (x) => {
        albumsArray = [
          ...albumsArray,
          {
            id: x.id,
            name: x.name,
            artistId: artistId,
            tracks: undefined,
            image: x.images[0].url,
            rank: 0,
          },
        ];
      });
    });

  console.log(albumsArray);
  res.json(albumsArray);
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
    redirectUri: process.env.REACT_APP_REDIRECT_URL,
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

app.put("/rank-tracks/:albumId", requireAuth, async (req, res) => {
  const auth0Id = req.auth.payload.sub;

  const albumId = req.params.albumId;

  const tracks = req.body;

  const user = await prisma.user.findUnique({
    where: {
      auth0Id,
    },
  });

  var spotifyApi = new SpotifyWebApi({
    clientId: process.env.REACT_APP_SPOTIFY_CLIENT_ID,
    clientSecret: process.env.REACT_APP_SPOTIFY_CLIENT_SECRET,
    redirectUri: process.env.REACT_APP_REDIRECT_URL,
  });

  spotifyApi.setAccessToken(user.accessToken);
  spotifyApi.setRefreshToken(user.refreshToken);

  const album = await spotifyApi.getAlbum(albumId);

  console.log(album);

  const newAlbum = await prisma.album.upsert({
    where: {
      id: albumId,
    },
    update: {
      tracks: {},
      rank: 1,
    },
    create: {
      name: album.body.name,
      image: album.body.images[0].url,
      authorId: user.id,
      tracks: {},
      rank: 1,
      id: albumId,
    },
  });

  tracks.map(async (track, index) => {
    if (track.id && track.name && track.href) {
      const newTrack = await prisma.track.upsert({
        where: {
          id: track.id,
        },
        update: {
          rank: index,
        },
        create: {
          authorId: user.id,
          id: track.id,
          name: track.name,
          albumId: albumId,
          preview: track.href,
          rank: index,
        },
      });
    }
  });

  res.json("succeeded");
});

app.delete("/delete-rank/:albumId", requireAuth, async (req, res) => {
  const auth0Id = req.auth.payload.sub;

  const user = await prisma.user.findUnique({
    where: {
      auth0Id,
    },
  });

  const albumId = req.params.albumId;
  console.log(albumId);

  const deleteTrack = await prisma.track.deleteMany({
    where: {
      albumId: albumId,
      
    },
  });

  const updateAlbum = await prisma.album.update({
    where: { id: albumId },
    data: {
      rank: 0,
    },
  });

  res.json(deleteTrack);
});

app.get("/get-ranked-albums", requireAuth, async (req, res) => {
  const auth0Id = req.auth.payload.sub;

  const user = await prisma.user.findUnique({
    where: {
      auth0Id,
    },
  });

  try {
    const albums = await prisma.album.findMany({
      where: { rank: 1, authorId: user.id },
    });
    console.log("albums");
    res.json(albums);
  } catch (e) {
    console.log(e);
  }
});

app.get("/get-ranked-tracks/:albumId", requireAuth, async (req, res) => {
  const auth0Id = req.auth.payload.sub;

  const albumId = req.params.albumId;

  const user = await prisma.user.findUnique({
    where: {
      auth0Id,
    },
  });

  try {
    const tracks = await prisma.track.findMany({
      where: { albumId: albumId, authorId: user.id },
    });
    res.json(tracks);
  } catch (e) {
    console.log(e);
  }
});

const PORT = parseInt(process.env.PORT) || 8080;

app.listen(PORT, () => {
 console.log(`Server running on http://localhost:${PORT} 🎉 🚀`);
});


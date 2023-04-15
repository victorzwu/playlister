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

const scopes = ["user-read-private", "user-read-email"];
const redirectUri = "https://example.com/callback";
const clientId = "5fe01282e44241328a84e7c5cc169165";
const state = "some-state-of-my-choice";

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
      },
    });

    res.json(newUser);
  }
});

app.post("/accesstoken", requireAuth, async (req, res) => {

  const spotifyApi = new spotifyWebApi({
    redirectUri:process.env.REACT_APP_REDIRECT_URL,
    clientId:process.env.CLIENT_ID,
    clientSecret:process.env.CLIENT_SECRET,
})

spotifyApi.authorizationCodeGrant(code).then(
  function(data) {
    console.log('The token expires in ' + data.body['expires_in']);
    console.log('The access token is ' + data.body['access_token']);
    console.log('The refresh token is ' + data.body['refresh_token']);

    // Set the access token on the API object to use it in later calls
    spotifyApi.setAccessToken(data.body['access_token']);
    spotifyApi.setRefreshToken(data.body['refresh_token']);
  },
  function(err) {
    console.log('Something went wrong!', err);
  }
).then(data => {
  res.json({
      accessToken:data.body.access_token,
      refreshToken:data.body.refresh_token,
      expiresIn: data.body.expires_in
  })}).catch(() => {
    res.sendStatus(400)
})


});

app.listen(8000, () => {
  console.log("Server running on http://localhost:8000 🎉 🚀");
});

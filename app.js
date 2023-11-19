// Start the server
const port = 2015;

const express = require("express");
const multer = require("multer");

const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

const bodyParser = require("body-parser");

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: "dtf0dx4pr",
  api_key: "517795581448813",
  api_secret: "ccHMCwEN9QTsXEM4w77Ch5Tl6oA",
});

// Multer configuration for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage });

const streamifier = require("streamifier"); // Add the 'streamifier' package
const stream = require("stream");

const fs = require("fs");

// mongoose
const mongoose = require("mongoose");

mongoose
  .connect(
    "mongodb+srv://AbanoubSaad:dev@cluster0.yoqimye.mongodb.net/mdrsa-esmo-efnoty-llshmamsa?retryWrites=true&w=majority"
  )
  .then((result) => {
    app.listen(process.env.PORT || port, () => {
      console.log(`Example app listening at http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error!", err);
  });

//start page
app.get('/', (req, res) => {
  res.render('index')
})

app.get('/profile', (req, res) => {
  res.render('profile')
})
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



//middleare for auth
//session set up
const session = require("express-session");

//token
const jwt = require("jsonwebtoken");

app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: true,
  })
);

// Generate JWT token
const generateToken = (user) => {
  const secretKey = "marigerges-e3dadi-taio"; // Replace with your own secret key
  const payload = {
    userId: user._id,
    username: user.username,
    // Include any additional data you want in the token payload
  };
  const options = {
    expiresIn: "1h", // Token expiration time
  };

  return jwt.sign(payload, secretKey, options);
};

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization || req.session.token;

  if (!token) {
    return res.redirect("/login");
  }

  // Verify the token here
  const secretKey = "marigerges-e3dadi-taio"; // Replace with your own secret key

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(401).send("Invalid token");
    }

    const userId = decoded.userId;

    User.findById(userId)
      .then((user) => {
        if (!user) {
          return res.status(401).send("Invalid token after decoded");
        }

        req.user = user;
        const loggedUser = req.user
        res.locals.loggedUser = loggedUser;
        req.session.loggedUser = loggedUser;
        next();
      })
      .catch((err) => {
        console.error("Error verifying token:", err);
        res.status(500).send("An error occurred while verifying the token");
      });
  });
};

const isAdmin= (req, res, next)=>{
  if(foundedUser.role === 'خادم'){
    next()
  }else{
    res.send('you are not authorized')
  }
}

//models
const User = require("./models/userModel");

//start page
app.get('/', (req, res) => {
  res.render('index')
})

app.get('/login', (req, res) => {
  res.redirect('/')
})

app.post('/login', function (req, res) {
  let {username , code } =req.body;
  User.findOne({
    username : username,
    code : code
  }).then((result)=>{
    if(result.username === username && result.code === code){
      const token = generateToken(result);
        req.headers.authorization = token;
        req.session.token = token;
        res.redirect('/profile')
    }else{
      res.redirect('/')
    }
  })
})

app.post('/logOut',verifyToken, function (req, res) {
  // Delete the token from the session
  delete req.session.token;

  // Send a response indicating successful logout
  res.redirect('/');
});

app.get('/profile', verifyToken , (req, res) => {
  res.render('profile')
})

//routes
const waitingRoutes = require('./routes/waiting')
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/user');



app.use('/waiting',waitingRoutes)
app.use('/admin', verifyToken ,adminRoutes)
app.use('/user', verifyToken ,userRoutes)
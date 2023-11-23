const express = require("express");
const router = express.Router();

//session set up
const session = require("express-session");

router.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: true,
  })
);

//upload set up
const multer = require("multer");
const bodyParser = require("body-parser");
// parse application/x-www-form-urlencoded
router.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
router.use(bodyParser.json());

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

//models
const Waiting = require("../models/waitingModel");
const User = require("../models/userModel");
const Lecture = require("../models/lecModel");
const studentLec = require("../models/students'lecModel");

router.get("/waiting", (req, res) => {
  Waiting.find().then((result) => {
    res.render("waiting-list", { waitingList: result });
  });
});

router.get("/add-user/:waitingID", (req, res) => {
  Waiting.findById(req.params.waitingID).then((waitingResult) => {
    res.render("add-user", { objWaiting: waitingResult });
  });
});

router.post("/add-user", function (req, res) {
  const {
    name,
    className,
    age,
    birthDayDate,
    address,
    shmosyaDate,
    phone,
    whats,
    father,
    code,
    username,
    role,
  } = req.body;
  console.log("req.body :>> ", req.body);
  Waiting.findOne({
    name: name,
    className: className,
    age: age,
    birthDayDate: birthDayDate,
    address: address,
    shmosyaDate: shmosyaDate,
    phone: phone,
    whats: whats,
    father: father,
  }).then((waitingResult) => {
    console.log("waiting user: >>", waitingResult);
    const newUser = new User({
      name: name,
      className: className,
      age: age,
      birthDayDate: birthDayDate,
      address: address,
      shmosyaDate: shmosyaDate,
      phone: phone,
      whats: whats,
      father: father,
      code: code,
      username: username,
      role: role,
      imgURL: waitingResult.imgURL,
    });
    newUser.save().then((result) => {
      Waiting.deleteOne(waitingResult).then((deletedWaiting) => {
        res.redirect("/admin/waiting");
      });
    });
  });
});

router.get("/add-lec", (req, res) => {
  res.render("add-lec");
});

router.post(
  "/add-lec",
  upload.fields([
    { name: "contentImgs", maxCount: 10 },
    { name: "contentAudio", maxCount: 3 },
  ]),
  async (req, res) => {
    try {
      const { name, date } = req.body;
      let { contentsTypes, contentsNames, al7anTypes } = req.body;
      let content = [];
      // Convert contentsTypes , contentsNames and al7anTypes to arrays if they are not already
      if (!Array.isArray(contentsTypes)) {
        contentsTypes = [contentsTypes];
      }
      if (!Array.isArray(contentsNames)) {
        contentsNames = [contentsNames];
      }
      if (!Array.isArray(al7anTypes)) {
        al7anTypes = [al7anTypes];
      }

      // Upload content images
      const contentImgsURL = await Promise.all(
        req.files["contentImgs"].map(async (file) => {
          if (file.mimetype.startsWith("image")) {
            return await handleImageUpload(file.buffer);
          } else {
            throw new Error("Unsupported file type for content image");
          }
        })
      );

      // Upload content audio
      const contentAudioURL = await Promise.all(
        req.files["contentAudio"].map(async (file) => {
          if (file.mimetype.startsWith("audio")) {
            return await handleAudioUpload(file.buffer);
          } else {
            throw new Error("Unsupported file type for content audio");
          }
        })
      );

      for (let i = 0; i < contentsNames.length; i++) {
        let contentName = contentsNames[i];
        let contentType = contentsTypes[i];
        let al7anType = al7anTypes[i];
        content.push({
          contentName: contentName,
          contentType: contentType,
          al7anType: al7anType,
        });
      }
      const newLecture = new Lecture({
        name: name,
        content: content,
        date: date,
        contentImgsURL: contentImgsURL,
        contentAudioURL: contentAudioURL,
      });
      console.log("newLecture", newLecture);

      // Save the new lecture to get its ID
      const savedLecture = await newLecture.save();
      console.log("newLecture", savedLecture);

      const loggedUser = req.session.loggedUser;

      const students = await User.find({ className: loggedUser.className });
      console.log("students", students);

      let studentsLec = [];

      for (j = 0; j < students.length; j++) {
        let student = students[j];
        let studentId = student._id;

        const newStudentLec = studentsLec.push({
          studentID: studentId,
          lecID: newLecture._id,
        });

        console.log("newStudentLec :>> ", newStudentLec);
      }

      console.log("studentsLec :>> ", studentsLec);

      // Save the array of studentLec objects to the studentLecModel
      const savedStudentLecArray = await studentLec.create(studentsLec);
      console.log("savedStudentLecArray", savedStudentLecArray);
      res.redirect('/admin/add-lec')
    } catch (error) {
      console.error("Error:>>", error);
      res
        .status(500)
        .json({ error: "An error occurred while uploading the media" });
    }
  }
);

// Function to handle image upload
async function handleImageUpload(buffer) {
  const bufferStream = new stream.PassThrough();
  bufferStream.end(buffer);

  const temporaryFilePath = `./temp/${Date.now()}_image`;

  try {
    // Create the temporary file
    await fs.promises.writeFile(temporaryFilePath, buffer);

    // Upload the file to Cloudinary using the local file path
    const result = await cloudinary.uploader.upload(temporaryFilePath, {
      folder: "mdrsa-esmo-efnoty-lecture-content-images",
    });

    // Check if the file exists before attempting to unlink it
    await fs.promises.access(temporaryFilePath, fs.constants.F_OK);

    // Remove the temporary file after upload
    await fs.promises.unlink(temporaryFilePath);

    return result.secure_url;
  } catch (error) {
    console.error("Error:", error.message);

    // Handle any errors, such as unlinking the file if an error occurs during upload
    try {
      // Check if the file exists before attempting to unlink it
      await fs.promises.access(temporaryFilePath, fs.constants.F_OK);

      // Remove the temporary file after upload
      await fs.promises.unlink(temporaryFilePath);
    } catch (unlinkError) {
      console.error("Error while unlinking:", unlinkError.message);
    }

    throw error; // Re-throw the original error after handling
  }
}

const { Readable } = require("stream");

// Function to handle audio upload
async function handleAudioUpload(buffer) {
  const bufferStream = new Readable();
  bufferStream.push(buffer);
  bufferStream.push(null); // Signal the end of the stream

  const temporaryFilePath = `./temp/${Date.now()}_audio`;

  try {
    // Create the temporary file
    await fs.promises.writeFile(temporaryFilePath, buffer);

    // Upload the file to Cloudinary using the local file path
    const result = await cloudinary.uploader.upload(temporaryFilePath, {
      folder: "mdrsa-esmo-efnoty-lecture-content-audio",
      resource_type: "video", // Explicitly set resource type for audio files
    });

    // Check if the file exists before attempting to unlink it
    await fs.promises.access(temporaryFilePath, fs.constants.F_OK);

    // Remove the temporary file after upload
    await fs.promises.unlink(temporaryFilePath);

    return result.secure_url;
  } catch (error) {
    console.error("Error:", error.message);

    // Handle any errors, such as unlinking the file if an error occurs during upload
    try {
      // Check if the file exists before attempting to unlink it
      await fs.promises.access(temporaryFilePath, fs.constants.F_OK);

      // Remove the temporary file after upload
      await fs.promises.unlink(temporaryFilePath);
    } catch (unlinkError) {
      console.error("Error while unlinking:", unlinkError.message);
    }

    throw error; // Re-throw the original error after handling
  }
}

module.exports = router;

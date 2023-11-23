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

//models
const User = require("../models/userModel");
const Lecture = require("../models/lecModel");
const studentLec = require("../models/students'lecModel");

router.get("/lectures", async (req, res) => {
  try {
    const loggedUser = req.session.loggedUser;

    console.log('loggedUser._id :>> ', loggedUser._id);

    // Find the lectures associated with the user in the studentLec model
    const studentLecEntries = await studentLec.find({ studentID: loggedUser._id });

    console.log("studentLecEntries :>> ", studentLecEntries);

    // Extract the lecture IDs from the studentLec entries
    const lectureIds = studentLecEntries.map((entry) => entry.lecID);
    console.log("lectureIds :>> ", lectureIds);

    // Retrieve the lectures from the Lecture model based on the IDs
    const lectures = await Lecture.find({ _id: { $in: lectureIds } });
    console.log("lectures :>> ", lectures);
    // Extract the content from each lecture
    const lecturesData = lectures.map((lecture) => lecture);

    console.log("lecturesContent :>> ", lecturesData);

    // Send the lectures content as a response
    res.render("user-lectures", { arrlecturesContent: lecturesData });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();

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

router.get('/',(req,res)=>{
  Waiting.find().then((result)=>{
    res.render('waiting-list',{waitingList:result})
  })
})

router.get('/register', (req, res) => {
  res.render('register')
})

router.post("/register", upload.single("profileImg"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }


    const { name, className, age, birthDayDate , address , shmosyaDate , phone , whats , father } = req.body;

    let result;

    // Check the file type based on mimetype
    if (req.file.mimetype.startsWith("image")) {
      // Handle image upload
      result = await handleImageUpload(req.file.buffer);
    }  else {
      return res.status(400).json({ error: "Unsupported file type" });
    }
    // Respond with the uploaded media URL and product details
    console.log('result :>> ', result.secure_url, name, className, age, birthDayDate , address , shmosyaDate , phone , whats , father  );
    const newWaiting= new Waiting({
      name:name,
      className:className,
      age:age,
      birthDayDate:birthDayDate,
      address:address,
      shmosyaDate:shmosyaDate,
      phone:phone,
      whats:whats,
      father:father,
      imgURL:result.secure_url,
      
    });
    
    await newWaiting.save();
    res.redirect('/waiting/message');
  } catch (error) {
    console.error("Error:>>", error);
    res
      .status(500)
      .json({ error: "An error occurred while uploading the media" });
  }
});

async function handleImageUpload(buffer) {
  // Convert the buffer to a Readable Stream
  const bufferStream = new stream.PassThrough();
  bufferStream.end(buffer);

  // Save the buffer to a temporary file using createWriteStream
  const temporaryFilePath = `./temp/${Date.now()}_image`;
  const writeStream = fs.createWriteStream(temporaryFilePath);
  bufferStream.pipe(writeStream);

  // Wait for the write stream to finish
  await new Promise((resolve, reject) => {
    writeStream.on('finish', resolve);
    writeStream.on('error', reject);
  });

  // Upload the file to Cloudinary using the local file path
  const result = await cloudinary.uploader.upload(temporaryFilePath, { folder: 'esmo-efnoty-profile-photo' });

  // Remove the temporary file after upload
  fs.unlinkSync(temporaryFilePath);

  return result;
}
router.get('/message',(req,res) => {
  res.render('waiting-msg')
})


module.exports = router;

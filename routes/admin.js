const express = require("express");
const router = express.Router();

//models
const Waiting = require("../models/waitingModel");
const User = require('../models/userModel');

router.get('/waiting',(req,res)=>{
  Waiting.find().then((result)=>{
    res.render('waiting-list',{waitingList:result})
  })
})

router.get('/add-user/:waitingID',(req,res)=>{
  Waiting.findById(req.params.waitingID).then((waitingResult)=>{
    res.render('add-user',{objWaiting:waitingResult})
  })
})

router.post('/add-user', function (req, res) {
  const { name, className, age, birthDayDate , address , shmosyaDate , phone , whats , father , code , username , role} = req.body;
  console.log('req.body :>> ', req.body);
  Waiting.findOne({
    name:name,
    className:className,
    age:age,
    birthDayDate :birthDayDate,
    address:address,
    shmosyaDate:shmosyaDate,
    phone:phone,
    whats:whats,
    father:father
  }).then((waitingResult)=>{
    console.log('waiting user: >>',waitingResult);
    const newUser = new User({
      name:name,
      className:className,
      age:age,
      birthDayDate :birthDayDate,
      address:address,
      shmosyaDate:shmosyaDate,
      phone:phone,
      whats:whats,
      father:father,
      code:code,
      username:username,
      role:role,
      imgURL:waitingResult.imgURL
    })
    newUser.save().then((result)=>{
      Waiting.deleteOne(waitingResult).then((deletedWaiting)=>{
        res.redirect('/waiting')
      })
      
    })
  })
})





module.exports = router;
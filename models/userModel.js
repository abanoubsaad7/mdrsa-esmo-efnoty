const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema ({
    name:String,
    className:String,
    age:String,
    birthDayDate:String,
    username:{
      type: String,
      unique: true
    },
    code:{
      type:String,
      unique : true
    },
    address:String,
    shmosyaDate:String,
    phone:String,
    whats:String,
    father:String,
    imgURL:String,
    role:String
});
const User = mongoose.model("User",userSchema);

module.exports = User;
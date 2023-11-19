const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const waitingSchema = new Schema ({
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
});
const Waiting = mongoose.model("Waiting",waitingSchema);

module.exports = Waiting;
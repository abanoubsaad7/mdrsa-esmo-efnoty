const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const lectureSchema = new Schema ({
    name:String,
    content:Array,
    date:String,
    contentImgsURL:Array,
    contentAudioURL:Array,
});
const Lecture = mongoose.model("Lecture",lectureSchema);

module.exports = Lecture;

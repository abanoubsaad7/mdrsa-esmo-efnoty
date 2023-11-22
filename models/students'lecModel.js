const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const studentLecSchema = new Schema ({
    studentID: mongoose.Types.ObjectId,
    lecID: mongoose.Types.ObjectId
});
const studentLec = mongoose.model("studentLec",studentLecSchema);

module.exports = studentLec;

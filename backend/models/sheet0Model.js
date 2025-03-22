const mongoose = require("mongoose");

const sheet0 = new mongoose.Schema(
  {
    "Student First": { type: String, required: true },
    "Student Last": { type: String, required: false },
    "Grade": { type: String, required: false },
    "Student Email": { type: String, required: false },
    "Student Cell": { type: String, required: false },
    "Parent 1 First": { type: String, required: false },
    "Parent 1 Last": { type: String, required: false },
    "Parent 1 email": { type: String, required: false },
    "Parent 1 cell": { type: String, required: false },
    "Parent 2 First": { type: String, required: false },
    "Parent 2 Last": { type: String, required: false },
    "Parent 2 email": { type: String, required: false },
    "Parent 2 cell": { type: String, required: false },
    "Instrument": { type: String, required: false },
  },
  { timestamps: false }
);

const Sheet0Row = mongoose.model("sheet0", sheet0);
module.exports = Sheet0Row;

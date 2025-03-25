const mongoose = require("mongoose");

const sheet = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        columns: {
            type: Array,
            required: true
        },
    }
);

const Sheet = mongoose.model("Sheet", sheet);
module.exports = Sheet;
const mongoose = require("mongoose");

const sheetRow = new mongoose.Schema(
    {
        "sheetId": { type: mongoose.Schema.Types.ObjectId, required: true },
        "data": {
            type: Object,
            required: true,
            validate: {
                validator: function (v) {
                    return v !== null && typeof v === 'object';
                },
                message: props => `${props.value} is not a valid object!`
            }
        },
    },
    { timestamps: true }
);

const SheetRow = mongoose.model("sheetRow", sheetRow);
module.exports = SheetRow;
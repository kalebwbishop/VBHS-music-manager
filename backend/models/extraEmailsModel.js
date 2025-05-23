const mongoose = require('mongoose');

const extraEmailsSchema = new mongoose.Schema({
    directorEmails: {
        type: [String],
        default: []
    },
    otherEmails: {
        type: [String],
        default: []
    }
}, {
    timestamps: true
});

const ExtraEmails = mongoose.model('ExtraEmails', extraEmailsSchema);

module.exports = ExtraEmails;

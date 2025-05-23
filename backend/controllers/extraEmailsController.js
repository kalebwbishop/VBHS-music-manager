const ExtraEmails = require('../models/extraEmailsModel');

// Get all email lists
const getEmailLists = async (req, res) => {
    try {
        // Find the first document or create one if it doesn't exist
        let emailLists = await ExtraEmails.findOne();
        
        if (!emailLists) {
            emailLists = await ExtraEmails.create({});
        }
        
        res.status(200).json(emailLists);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update email lists
const updateEmailLists = async (req, res) => {
    try {
        const { directorEmails, otherEmails } = req.body;
        
        // Find the first document or create one if it doesn't exist
        let emailLists = await ExtraEmails.findOne();
        
        if (!emailLists) {
            emailLists = await ExtraEmails.create({
                directorEmails,
                otherEmails
            });
        } else {
            emailLists.directorEmails = directorEmails;
            emailLists.otherEmails = otherEmails;
            await emailLists.save();
        }
        
        res.status(200).json(emailLists);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getEmailLists,
    updateEmailLists
};

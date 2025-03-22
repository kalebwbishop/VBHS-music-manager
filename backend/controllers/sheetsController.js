const { response } = require("express");
const Sheet0Row = require("../models/sheet0Model");
const { encryptObject, decryptObject } = require("../utils/encryption");

// Get all students
async function getSheetsRows(req, res) {
    const sheets = [{
        name: "Sheet0",
        model: Sheet0Row,
    }];

    try {
        // Fetch all students from the database
        const allStudents = await Promise.all(sheets.map(async (sheet) => {
            const students = await sheet.model.find();
            return students.map(student => decryptObject(student.toObject()));
        }));

        const responseData = {};
        sheets.forEach((sheet, index) => {
            responseData[sheet.name] = allStudents[index];
        });

        res.json(responseData);

    } catch (error) {
        console.error("Error fetching students:", error);
        res.status(500).json({ message: "Error fetching students", error });
    }
}

module.exports = { getSheetsRows };
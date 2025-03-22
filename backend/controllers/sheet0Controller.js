const Sheet0Row = require("../models/sheet0Model");
const { encryptObject, decryptObject } = require("../utils/encryption");

// Get all students
async function getSheet0Rows(req, res) {
    try {
        const students = await Sheet0Row.find();

        if (!students.length) {
            return res.status(404).json({ message: "No students found" });
        }

        const decryptedStudents = students.map(student => decryptObject(student.toObject()));
        res.json(decryptedStudents);
    } catch (error) {
        console.error("Error fetching students:", error);
        res.status(500).json({ message: "Error fetching students", error });
    }
}

// Add new students (single or batch)
async function addSheet0Row(req, res) {
    try {
        const requestBody = req.body;

        if (Array.isArray(requestBody)) {
            // Batch insert
            const encryptedStudents = requestBody.map(student => encryptObject(student));
            const newStudents = await Sheet0Row.insertMany(encryptedStudents);
            res.status(201).json({ message: "Students added successfully", students: newStudents });
        } else {
            // Single insert
            const encryptedData = encryptObject(requestBody);
            const newStudent = new Sheet0Row(encryptedData);
            await newStudent.save();
            res.status(201).json({ message: "Student added successfully", student: newStudent });
        }
    } catch (error) {
        console.error("Error adding student(s):", error);
        res.status(400).json({ message: "Error adding student(s)", error });
    }
}

// Update a student by ID
async function updateSheet0Row(req, res) {
    try {
        const id = req.params.id; // Assuming the ID is passed as a URL parameter
        const updatedData = req.body;

        if (!id || !updatedData) {
            return res.status(400).json({ message: "ID and updated data are required" });
        }

        const encryptedData = encryptObject(updatedData);
        const updatedStudent = await Sheet0Row.findByIdAndUpdate(id, encryptedData, { new: true });

        if (!updatedStudent) {
            return res.status(404).json({ message: "Student not found" });
        }

        res.status(200).json({ message: "Student updated successfully", student: decryptObject(updatedStudent.toObject()) });
    }
    catch (error) {
        console.error("Error updating student:", error);
        res.status(500).json({ message: "Error updating student", error });
    }
}

// Delete a student by ID
async function deleteSheet0Row(req, res) {
    try {
        const id = req.params.id; // Assuming the ID is passed in the request body
        if (!id) {
            return res.status(400).json({ message: "ID is required" });
        }

        console.log("Deleting student with ID:", id);

        const deletedStudent = await Sheet0Row.findByIdAndDelete(id);

        if (!deletedStudent) {
            return res.status(404).json({ message: "Student not found" });
        }

        res.status(200).json({ message: "Student deleted successfully", student: deletedStudent });
    } catch (error) {
        console.error("Error deleting student:", error);
        res.status(500).json({ message: "Error deleting student", error });
    }
}

module.exports = { getSheet0Rows, addSheet0Row, updateSheet0Row, deleteSheet0Row };

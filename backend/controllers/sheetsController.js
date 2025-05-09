const Sheet = require("../models/sheetModel");
const SheetRow = require("../models/sheetRowModel");
const { encryptObject, decryptObject } = require("../utils/encryption");

// Get all sheets and their decrypted rows
async function getSheetsRows(req, res) {
    try {
        const sheets = await Sheet.find(); // Fetch all sheet metadata dynamically
        const responseData = [];

        await Promise.all(sheets.map(async (sheet) => {
            try {
                let records = await SheetRow.find({ sheetId: sheet._id });

                if (records.length === 0) {
                    responseData.push({ _id: sheet._id, name: sheet.name, columns: sheet.columns, rows: [] });
                    return;
                }

                responseData.push({
                    _id: sheet._id,
                    name: sheet.name,
                    columns: sheet.columns,
                    rows: records.map(record => {
                        const decryptedData = decryptObject(record.data);
                        return {
                            _id: record._id,
                            ...decryptedData
                        };
                    })
                });
            } catch (error) {
                console.error(`Error fetching rows for sheet ${sheet.name}:`, error);
                responseData.push({ _id: sheet._id, name: sheet.name, columns: sheet.columns, rows: [] });
            }
        }));

        res.json(responseData);
    } catch (error) {
        console.error("Error fetching all sheets:", error);
        res.status(500).json({ message: "Error fetching sheets", error });
    }
}

// Add a new sheet with encryption
async function addSheet(req, res) {
    const { name, columns } = req.body;

    try {
        const newSheet = new Sheet({ name, columns });

        await newSheet.save();
        res.status(201).json({ message: "Sheet added successfully", data: { id: newSheet._id } });
    } catch (error) {
        console.error("Error adding sheet:", error);
        res.status(500).json({ message: "Error adding sheet", error });
    }
}

// Update a sheet with encryption
async function updateSheet(req, res) {
    const { sheetId } = req.params;
    const { name, columns } = req.body;

    try {
        const originalSheet = await Sheet.findById(sheetId);
        if (!originalSheet) {
            return res.status(404).json({ message: "Sheet not found" });
        }


        const updatedSheet = await Sheet.findByIdAndUpdate(
            sheetId,
            { name, columns },
            { new: true }
        );

        if (!updatedSheet) {
            return res.status(404).json({ message: "Sheet not found" });
        }

        // Update the rows in the sheet
        const rows = await SheetRow.find({ sheetId });
        await Promise.all(rows.map(async (row) => {
            try {
                const decryptedData = decryptObject(row.data);

                const updatedData = {};
                originalSheet.columns.forEach((col, index) => {
                    // If the column has changed, update the key in the decrypted data
                    // to match the new column name
                    if (!columns[index]) {
                        return;
                    }
                    if (columns[index] !== col) {
                        updatedData[columns[index]] = decryptedData[col];
                    }
                    else {
                        updatedData[col] = decryptedData[col];
                    }
                });

                const encryptedData = encryptObject(updatedData);
                await SheetRow.findByIdAndUpdate(row._id, { data: encryptedData });
            } catch (error) {
                console.error(`Error updating row ${row._id}:`, error);
            }
        }));
        


        res.status(200).json({ message: "Sheet updated successfully", updatedSheet });
    } catch (error) {
        console.error("Error updating sheet:", error);
        res.status(500).json({ message: "Error updating sheet", error });
    }
}

// Delete a sheet
async function deleteSheet(req, res) {
    const { sheetId } = req.params;

    try {
        // Delete the sheet first
        const deletedSheet = await Sheet.findByIdAndDelete(sheetId);
        if (!deletedSheet) {
            return res.status(404).json({ message: "Sheet not found" });
        }

        // Then delete all associated rows
        const result = await SheetRow.deleteMany({ sheetId });

        res.status(200).json({ message: "Sheet deleted successfully" });
    } catch (error) {
        console.error("Error deleting sheet:", error);
        res.status(500).json({ message: "Error deleting sheet", error });
    }
}


// Add new row
async function addSheetRow(req, res) {
    try {
        const { sheetId } = req.params;
        const sheet = await Sheet.findById(sheetId);
        if (!sheet) {
            return res.status(404).json({ message: "Sheet not found" });
        }

        const requestBody = req.body;

        if (Array.isArray(requestBody)) {
            // Batch insert
            const encryptedRows = requestBody.map(student => ({
                sheetId: sheet._id,
                data: encryptObject(student)
            }));

            // Build $or conditions to check for existing students
            const matchConditions = encryptedRows.map(row => ({
                sheetId: sheet._id,
                'data.Student First': row.data['Student First'],
                'data.Student Last': row.data['Student Last']
            }));

            const existingStudents = await SheetRow.find({ $or: matchConditions });

            const existingMap = new Map();
            existingStudents.forEach(student => {
                const key = `${student.data['Student First']}|${student.data['Student Last']}`;
                existingMap.set(key, student);
            });

            const updatePromises = [];
            const studentsToCreate = [];

            encryptedRows.forEach(row => {
                const key = `${row.data['Student First']}|${row.data['Student Last']}`;
                const existing = existingMap.get(key);

                if (existing) {
                    updatePromises.push(
                        SheetRow.findByIdAndUpdate(
                            existing._id,
                            { data: row.data },
                            { new: true }
                        )
                    );
                } else {
                    studentsToCreate.push(row);
                }
            });

            const [updatedStudents, newStudents] = await Promise.all([
                Promise.all(updatePromises),
                studentsToCreate.length > 0 ? SheetRow.insertMany(studentsToCreate) : []
            ]);

            const allStudents = [...updatedStudents, ...newStudents];
            res.status(201).json({ message: "Students added successfully", students: allStudents });

        } else {
            // Single insert
            const encryptedData = encryptObject(requestBody);

            const existingStudent = await SheetRow.findOne({
                sheetId: sheet._id,
                'data.Student First': encryptedData['Student First'],
                'data.Student Last': encryptedData['Student Last']
            });

            let resultStudent;
            if (existingStudent) {
                existingStudent.data = encryptedData;
                await existingStudent.save();
                resultStudent = existingStudent;
            } else {
                resultStudent = new SheetRow({
                    sheetId: sheet._id,
                    data: encryptedData
                });
                await resultStudent.save();
            }

            res.status(201).json({ message: "Student added successfully", student: resultStudent });
        }

    } catch (error) {
        console.error("Error adding student(s):", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

// Update a row by ID
async function updateSheetRow(req, res) {
    try {
        const rowId = req.params.rowId; // Assuming the ID is passed as a URL parameter
        const updatedData = req.body;

        if (!rowId || !updatedData) {
            return res.status(400).json({ message: "ID and updated data are required" });
        }

        const encryptedData = encryptObject(updatedData);
        const updatedStudent = await SheetRow.findByIdAndUpdate(rowId, { data: encryptedData }, { new: true });

        if (!updatedStudent) {
            return res.status(404).json({ message: "Student not found" });
        }

        res.status(200).json({ message: "Student updated successfully", student: decryptObject(updatedStudent.toObject()) });
    } catch (error) {
        console.error("Error updating student:", error);
        res.status(500).json({ message: "Error updating student", error });
    }
}

// Delete a row by ID
async function deleteSheetRow(req, res) {
    try {
        const rowId = req.params.rowId; // Assuming the ID is passed in the request body
        if (!rowId) {
            return res.status(400).json({ message: "ID is required" });
        }

        const deletedStudent = await SheetRow.findByIdAndDelete(rowId);

        if (!deletedStudent) {
            return res.status(404).json({ message: "Student not found" });
        }

        res.status(200).json({ message: "Student deleted successfully" });
    } catch (error) {
        console.error("Error deleting student:", error);
        res.status(500).json({ message: "Error deleting student", error });
    }
}



module.exports = { getSheetsRows, addSheet, updateSheet, deleteSheet, addSheetRow, updateSheetRow, deleteSheetRow };

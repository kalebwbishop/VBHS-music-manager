import React, { useState } from "react";
import PropTypes from "prop-types";
import Papa from "papaparse";

function AddStudentComponent({
  data,
  setDisplayData,
  selectedSheetId,
  closeSidebar,
  setRefresh,
  accessToken,
}) {
  const [csvData, setCsvData] = useState(null);
  const [rowCount, setRowCount] = useState(0);
  const [hasHeaders, setHasHeaders] = useState(true);
  const [rawCsvData, setRawCsvData] = useState(null);
  const [addMultiple, setAddMultiple] = useState(false);

  const selectedSheet = data.find((sheet) => sheet._id === selectedSheetId);

  if (!selectedSheet || selectedSheet.length === 0) {
    return <p>No student data available.</p>;
  }

  const sheetHeaders = selectedSheet.columns.filter((cell) => cell.charAt(0) !== "_");

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = {};
    for (let i = 0; i < e.target.length; i++) {
      if (e.target[i].name) {
        formData[e.target[i].name] = e.target[i].value;
      }
    }

    fetch(`${window.env.REACT_APP_BACKEND_URL}/api/sheet/${selectedSheetId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(formData),
    })
      .then((response) => {
        if (response.status !== 201) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        if (!addMultiple) {
          closeSidebar();
        }
        e.target.reset();
        // Restore the checkbox state after form reset
        const addMoreCheckbox = e.target.querySelector('#addMore');
        if (addMoreCheckbox) {
          addMoreCheckbox.checked = addMultiple;
        }
        alert("Student added successfully!");
        setRefresh((prev) => !prev); // Trigger a refresh to update the data
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const parseCSVData = (rawCsvData, hasHeaders) => {
    // Create a mapping of sheet headers to CSV column indices
    const headerToIndexMap = {};
    
    if (hasHeaders) {
      // Create mapping of CSV headers to their indices
      const headerRow = rawCsvData[0];
      headerRow.forEach((header, index) => {
        headerToIndexMap[header.toLowerCase()] = index;
      });
    }

    const parsedStudents = rawCsvData.map((row, rowIndex) => {
      // Skip header row if hasHeaders is true
      if (hasHeaders && rowIndex === 0) return null;

      const student = {};
      
      // Map each sheet header to its corresponding CSV data
      sheetHeaders.forEach((header) => {
        if (hasHeaders) {
          // When using headers, look up the index in our mapping
          const csvIndex = headerToIndexMap[header.toLowerCase()];
          student[header] = csvIndex !== undefined ? row[csvIndex] || "" : "";
        } else {
          // When not using headers, use the default index-based mapping
          const index = sheetHeaders.indexOf(header);
          student[header] = row[index] || "";
        }
      });

      // Check if all fields are blank, if so, don't add the student
      if (Object.values(student).every(value => value === "")) {
        return null;
      }

      return student;
    }).filter(Boolean);

    const tempData = {
      columns: sheetHeaders,
      rows: parsedStudents,
    };

    setCsvData(parsedStudents);
    setRowCount(parsedStudents.length);
    setDisplayData(tempData);
  };

  const toggleHeaders = () => {
    if (!rawCsvData) return;

    const newHasHeaders = !hasHeaders;
    setHasHeaders(newHasHeaders);

    parseCSVData(rawCsvData, newHasHeaders);
  };

  const handleCSVUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      complete: (result) => {
        const csvRows = result.data;
        setRawCsvData(csvRows);
        parseCSVData(csvRows, hasHeaders);
      },
      header: false,
    });
  };

  const handleCSVSubmit = () => {
    if (!csvData) return;

    // Ensure each student has both first and last name fields
    const validatedData = csvData.map(student => {
      if (!student["Student First"] || !student["Student Last"]) {
        throw new Error("Each student must have both 'Student First' and 'Student Last' fields");
      }
      // Create a combined Student Name field for the backend
      return {
        ...student,
      };
    });

    // Use existing sheet data to check for duplicates
    const existingStudents = new Set(
      selectedSheet.rows.map(row => row["Student First"] + " " + row["Student Last"])
    );

    const studentsToUpdate = validatedData.filter(
      student => existingStudents.has(student["Student First"] + " " + student["Student Last"])
    );
    const studentsToAdd = validatedData.filter(
      student => !existingStudents.has(student["Student First"] + " " + student["Student Last"])
    );

    const confirmMessage = `Import Summary:\n` +
      `- ${studentsToAdd.length} new students to be added\n` +
      `- ${studentsToUpdate.length} existing students to be updated\n\n` +
      `Do you want to proceed?`;

    if (window.confirm(confirmMessage)) {
      // Proceed with the import
      fetch(
        `${window.env.REACT_APP_BACKEND_URL}/api/sheet/${selectedSheetId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(validatedData),
        }
      )
        .then((response) => {
          if (response.status !== 201) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((data) => {
          alert(`Import completed successfully!\n` +
            `- ${studentsToAdd.length} new students added\n` +
            `- ${studentsToUpdate.length} existing students updated`);
          closeSidebar();
          setCsvData(null);
          setRowCount(0);
        })
        .catch((error) => {
          console.error("Error:", error);
          alert(error.message || "Error adding/updating students");
        });
    }
  };

  return (
    <div style={{ paddingBottom: "50px" }}>
      <p>Here you can add new students.</p>

      {/* CSV Upload Section */}
      <div style={{ marginBottom: "15px" }}>
        <label style={{ fontWeight: "bold" }}>Upload CSV:</label>
        <div style={{ marginTop: "5px", display: "flex", alignItems: "center", gap: "10px" }}>
          <input
            type="file"
            accept=".csv"
            onChange={handleCSVUpload}
          />
        </div>
        {csvData && (
          <>
            <p style={{ fontSize: "0.8em", color: "#666", marginTop: "5px" }}>
              {rowCount} students
            </p>
            <button
              type="button"
              onClick={toggleHeaders}
              style={{
                padding: "5px 10px",
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                marginTop: "5px"
              }}
            >
              {hasHeaders ? "Use Placeholder Headers" : "Use First Row as Headers"}
            </button>
            <p style={{ fontSize: "0.8em", color: "#666", marginTop: "5px" }}>
              The students on the left will be added to the sheet.
            </p>
            <button
              onClick={handleCSVSubmit}
              style={{
                width: "250px",
                padding: "8px",
                backgroundColor: "#007BFF",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                marginTop: "10px"
              }}
            >
              Add Students from CSV
            </button>
          </>
        )}
      </div>

      {/* Manual Student Entry Form */}
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "10px" }}
      >
        {sheetHeaders.map((header, index) => (
          <div key={index} style={{ display: "flex", flexDirection: "column" }}>
            <label>{header}</label>
            <input
              type="text"
              name={header}
              style={{
                width: "250px",
                padding: "5px",
                border: "1px solid #ccc",
                borderRadius: "5px",
              }}
            />
          </div>
        ))}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            type="submit"
            style={{
              width: "250px",
              padding: "8px",
              backgroundColor: "#007BFF",
              color: "white",
              border: "none", 
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Add Student
          </button>
          <div style={{ display: "flex", alignItems: "center", marginLeft: "10px" }}>
            <input
              type="checkbox"
              id="addMore"
              checked={addMultiple}
              onChange={(e) => setAddMultiple(e.target.checked)}
              style={{ cursor: "pointer" }}
            />
            <label htmlFor="addMore" style={{ cursor: "pointer" }}>
              Add multiple
            </label>
          </div>
        </div>
      </form>
    </div>
  );
}

AddStudentComponent.propTypes = {
  data: PropTypes.array.isRequired,
  closeSidebar: PropTypes.func.isRequired,
  setRefresh: PropTypes.func.isRequired,
  accessToken: PropTypes.string.isRequired,
  setDisplayData: PropTypes.func.isRequired,
  selectedSheetId: PropTypes.string.isRequired,
};

export default AddStudentComponent;

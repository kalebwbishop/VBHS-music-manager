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
  const [useKeyHeaders, setUseKeyHeaders] = useState(true);
  const [rawCsvData, setRawCsvData] = useState(null);

  if (!data || data.length === 0) {
    return <p>No student data available.</p>;
  }

  const sheetHeaders = data.columns.filter((cell) => cell.charAt(0) !== "_");

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
        e.target.reset();
        alert("Student added successfully!");
        closeSidebar();
        setRefresh((prev) => !prev); // Trigger a refresh to update the data
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const parseCSVData = (rawCsvData, useKeyHeaders) => {

    const sheetHeaderToCsvHeaderMap = {};

    sheetHeaders.forEach((header, _) => {
      sheetHeaderToCsvHeaderMap[header] = rawCsvData[0].indexOf(header);
    });

    const parsedStudents = rawCsvData.map((row, rowIndex) => {
      const student = {};
      if (useKeyHeaders) {
        sheetHeaders.forEach((header, index) => {
          if (rowIndex !== 0) {
            student[header] = row[sheetHeaderToCsvHeaderMap[header]] || "";
          }
        });
      } else {
        sheetHeaders.forEach((header, index) => {
          student[header] = row[index] || "";
        });
      }

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

    const newUseKeyHeaders = !useKeyHeaders;
    setUseKeyHeaders(newUseKeyHeaders);

    parseCSVData(rawCsvData, newUseKeyHeaders);
  };

  const handleCSVUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      complete: (result) => {
        const csvRows = result.data;

        setRawCsvData(csvRows);

        parseCSVData(csvRows, useKeyHeaders);
      },
      header: false,
    });
  };

  const handleCSVSubmit = () => {
    if (!csvData) return;

    fetch(
      `${window.env.REACT_APP_BACKEND_URL}/api/sheet/${selectedSheetId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(csvData),
      }
    )
      .then((response) => {
        if (response.status !== 201) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        alert("Students added successfully!");
        setRefresh((prev) => !prev); // Trigger a refresh to update the data
        closeSidebar();
        setCsvData(null);
        setRowCount(0);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
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
        {rowCount > 0 && (
          <>
            <p style={{ fontSize: "0.8em", color: "#666", marginTop: "5px" }}>
              {rowCount} students will be imported
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
              {useKeyHeaders ? "Use CSV Headers as Keys" : "Use Indexed Headers"}
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

import React from "react";
import PropTypes from "prop-types";
import Papa from "papaparse";

function AddStudentComponent({
  data,
  selectedSheetIdx,
  closeSidebar,
  setRefresh,
  accessToken,
}) {

  if (!data || data.length === 0) {
    return <p>No student data available.</p>;
  }

  const headerRow = data[0].filter((cell) => cell.charAt(0) !== "_");

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const newStudent = {};

    headerRow.forEach((header) => {
      newStudent[header] = formData.get(header);
    });

    console.log("New Student Data: ", newStudent);

    fetch(`${window.env.REACT_APP_BACKEND_URL}/api/sheet/${selectedSheetIdx}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(newStudent),
    })
      .then((response) => {
        if (response.status !== 201) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Success:", data);
        event.target.reset();
        alert("Student added successfully!");
        closeSidebar();
        setRefresh((prev) => !prev); // Trigger a refresh to update the data
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const handleCSVUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      complete: (result) => {
        const [csvHeaders, ...csvRows] = result.data;
        const filteredHeaders = csvHeaders.filter(
          (header) => header.charAt(0) !== "_"
        );

        const parsedStudents = csvRows.map((row) => {
          const student = {};
          filteredHeaders.forEach((header, index) => {
            student[header] = row[index] || "";
          });
          return student;
        });

        fetch(
          `${window.env.REACT_APP_BACKEND_URL}/api/sheet/${selectedSheetIdx}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(parsedStudents),
          }
        )
          .then((response) => {
            if (response.status !== 201) {
              throw new Error("Network response was not ok");
            }
            return response.json();
          })
          .then((data) => {
            console.log("Bulk upload success:", data);
            alert("Students added successfully!");
            closeSidebar();
          })
          .catch((error) => {
            console.error("Error:", error);
          });
      },
      header: false,
    });
  };

  return (
    <div style={{ paddingBottom: "50px" }}>
      <p>Here you can add new students.</p>

      {/* CSV Upload Section */}
      <div style={{ marginBottom: "15px" }}>
        <label style={{ fontWeight: "bold" }}>Upload CSV:</label>
        <input
          type="file"
          accept=".csv"
          onChange={handleCSVUpload}
          style={{ marginTop: "5px" }}
        />
      </div>

      {/* Manual Student Entry Form */}
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "10px" }}
      >
        {headerRow.map((header, index) => (
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
  selectedSheetIdx: PropTypes.number.isRequired,
  closeSidebar: PropTypes.func.isRequired,
  setRefresh: PropTypes.func.isRequired,
  accessToken: PropTypes.string.isRequired,
};

export default AddStudentComponent;

import React from "react";
import PropTypes from "prop-types";

function ModifyStudentComponent({ data, selectedSheetIdx, closeSidebar, selectedRow, setRefresh, accessToken, sheetId }) {
  if (!data || data.length === 0) {
    return <p>No student data available.</p>;
  }

  // Get header row without underscore-prefixed keys
  const headerRow = data[0].filter((cell) => !cell.startsWith("_"));

  // Extract student data (adjusting for header row)
  const studentData = data[selectedRow + 1];
  if (!studentData) return <p>Invalid student selection.</p>;

  // Filter student data to match the non-underscore headers
  const initialValues = headerRow.map((header) => {
    const index = data[0].indexOf(header);
    return studentData[index];
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const updatedStudent = {};

    headerRow.forEach((header) => {
      updatedStudent[header] = formData.get(header);
    });

    console.log("Updated Student Data: ", updatedStudent);

    try {
      const response = await fetch(
        `${window.env.REACT_APP_BACKEND_URL}/api/sheet/${sheetId}/${studentData[0]}`, // Assuming the first column is the ID
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(updatedStudent),
        }
      );

      if (response.status !== 200) {
        throw new Error("Failed to update student data");
      }

      const result = await response.json();
      console.log("Success:", result);
      alert("Student updated successfully!");
      closeSidebar();
      setRefresh((prev) => !prev); // Trigger a refresh to update the data
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to update student.");
    }
  };

  return (
    <div style={{ paddingBottom: "50px" }}>
      <p>Here you can modify students.</p>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {headerRow.map((header, index) => (
          <div key={index} style={{ display: "flex", flexDirection: "column" }}>
            <label>{header}</label>
            <input
              type="text"
              name={header}
              defaultValue={initialValues[index] || ""}
              style={{ width: "250px", padding: "5px", border: "1px solid #ccc", borderRadius: "5px" }}
            />
          </div>
        ))}
        <button type="submit" style={{ width: "250px", padding: "8px", backgroundColor: "#28A745", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
          Update Student
        </button>
      </form>
    </div>
  );
}

ModifyStudentComponent.propTypes = {
  data: PropTypes.array.isRequired,
  selectedSheetIdx: PropTypes.number.isRequired,
  closeSidebar: PropTypes.func.isRequired,
  selectedRow: PropTypes.number.isRequired,
  setRefresh: PropTypes.func.isRequired,
  accessToken: PropTypes.string.isRequired,
  sheetId: PropTypes.string.isRequired,
};

export default ModifyStudentComponent;

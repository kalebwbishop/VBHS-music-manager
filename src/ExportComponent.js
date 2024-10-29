import React, { useState, useEffect } from "react";

function ExportComponent({ data }) {
  const [selectedColumns, setSelectedColumns] = useState([]);

  useEffect(() => {
    // Retrieve saved selected columns from cookies on load
    const savedColumns = document.cookie
      .split("; ")
      .find((row) => row.startsWith("selectedExportColumns="))
      ?.split("=")[1];

    if (savedColumns) {
      setSelectedColumns(JSON.parse(decodeURIComponent(savedColumns)));
    }
  }, []);

  const handleCheckboxChange = (index) => {
    setSelectedColumns((prev) => {
      const newSelectedColumns = prev.includes(index)
        ? prev.filter((col) => col !== index)
        : [...prev, index];

      document.cookie = `selectedExportColumns=${encodeURIComponent(
        JSON.stringify(newSelectedColumns)
      )}; path=/; max-age=31536000`;

      return newSelectedColumns;
    });
  };

  const handleButtonClick = () => {
    // Filter data to include only selected columns
    const filteredData = data.map((row) =>
      row.filter((_, index) => selectedColumns.includes(index))
    );

    // Convert data array to CSV format
    const csvContent = filteredData
      .map(
        (row) => row.map((item) => `"${item}"`).join(",") // Enclose each cell in quotes and join with commas
      )
      .join("\n"); // Join each row with a newline

    // Create a Blob from the CSV content and a URL for it
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    // Create a temporary anchor element and trigger download
    const link = document.createElement("a");
    link.href = url;

    const currentDate = new Date().toISOString().split("T")[0];
    link.setAttribute("download", `report-${currentDate}.csv`);

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <h3>Export</h3>
      <p>Select the columns to include in the export:</p>
      {data[0].map((header, index) => (
        <div key={index}>
          <label>
            <input
              type="checkbox"
              checked={selectedColumns.includes(index)}
              onChange={() => handleCheckboxChange(index)}
            />
            {header}
          </label>
        </div>
      ))}
      <button onClick={handleButtonClick}>Export</button>
    </div>
  );
}

export default ExportComponent;

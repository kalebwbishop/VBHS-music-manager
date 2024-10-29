import React, { useState, useEffect } from "react";

function EmailComponent({ data }) {
  const [selectedColumns, setSelectedColumns] = useState([]);

  useEffect(() => {
    // Retrieve saved selected columns from cookies on load
    const savedColumns = document.cookie
      .split("; ")
      .find((row) => row.startsWith("selectedEmailColumns="))
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

      document.cookie = `selectedEmailColumns=${encodeURIComponent(
        JSON.stringify(newSelectedColumns)
      )}; path=/; max-age=31536000`;

      return newSelectedColumns;
    });
  };

  const handleButtonClick = (method) => {
    const email = data.slice(1).map((row) => {
      return selectedColumns.map((colIndex) => row[colIndex]).filter(Boolean);
    });

    if (method === "clipboard") {
      const emailString = email.flat().join("; ");
      navigator.clipboard.writeText(emailString);
    } else if (method === "app") {
      const emailString = email.flat().join(", ");
      const subject = "VBHS Music Manager";
      const body = "Hello!";
      const mailto = `mailto:?bcc=${emailString}&subject=${encodeURIComponent(
        subject
      )}&body=${encodeURIComponent(body)}`;

      window.location.href = mailto;
    }
  };

  return (
    <div>
      <h3>Send Email</h3>
      <p>Select the columns to include in the email:</p>
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
      <button style={{ marginTop: 10 }} onClick={() => handleButtonClick("app")}>
        Send Via Default Email Provider
      </button>
      <button onClick={() => handleButtonClick("clipboard")}>Copy Emails to Clipboard</button>
    </div>
  );
}

export default EmailComponent;

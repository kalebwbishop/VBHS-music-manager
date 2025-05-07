import React, { useState, useMemo } from "react";
import PropTypes from "prop-types";

function EmailComponent({ data }) {
  const [sendToStudents, setSendToStudents] = useState(true);
  const [sendToParents, setSendToParents] = useState(true);

  const emailCounts = useMemo(() => {
    let studentCount = 0;
    let parentCount = 0;

    if (data && data.rows) {
      if (sendToStudents) {
        studentCount = data.rows.filter(row => row["Student Email"]).length;
      }
      if (sendToParents) {
        parentCount = data.rows.filter(row => row["Parent 1 email"] || row["Parent 2 email"]).length;
      }
    }

    return { studentCount, parentCount };
  }, [data, sendToStudents, sendToParents]);

  const handleButtonClick = (method) => {
    let emailColumns = [];

    if (sendToStudents) {
      emailColumns.push("Student Email");
    }

    if (sendToParents) {
      emailColumns.push("Parent 1 email");
      emailColumns.push("Parent 2 email");
    }

    const emails = data.rows.map((row) => emailColumns.map((column) => row[column]));
    const flatEmails = emails.flat().filter(email => email); // Filter out empty/null/undefined emails

    if (flatEmails.length === 0) {
      alert("No emails selected to send. Please check your selections.");
      return;
    }

    if (method === "clipboard") {
      const emailString = flatEmails.join("; ");
      navigator.clipboard.writeText(emailString);
    } else if (method === "app") {
      const emailString = flatEmails.join(", ");
      const subject = "";
      const body = "";
      const mailto = `mailto:?bcc=${emailString}&subject=${encodeURIComponent(
        subject
      )}&body=${encodeURIComponent(body)}`;

      window.location.href = mailto;
    }
  };

  return (
    <div>
      <h3>Send Email</h3>
      <p>Select who to email:</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <label style={{ 
          display: 'flex', 
          alignItems: 'center', 
          cursor: 'pointer',
          userSelect: 'none'
        }}>
          <input
            type="checkbox"
            checked={sendToStudents}
            onChange={(e) => setSendToStudents(e.target.checked)}
            style={{
              width: '18px',
              height: '18px',
              marginRight: '10px',
              cursor: 'pointer',
              accentColor: '#4a90e2'
            }}
          />
          <span style={{ fontSize: '16px' }}>Students</span>
        </label>
        <label style={{ 
          display: 'flex', 
          alignItems: 'center',
          cursor: 'pointer',
          userSelect: 'none'
        }}>
          <input
            type="checkbox"
            checked={sendToParents}
            onChange={(e) => setSendToParents(e.target.checked)}
            style={{
              width: '18px',
              height: '18px',
              marginRight: '10px',
              cursor: 'pointer',
              accentColor: '#4a90e2'
            }}
          />
          <span style={{ fontSize: '16px' }}>Parents</span>
        </label>
      </div>
      
      {sendToStudents && <p style={{ fontSize: "0.8em", color: "#666", marginTop: "5px" }}>
        {emailCounts.studentCount} student email{emailCounts.studentCount !== 1 ? 's' : ''} selected
      </p>}
      {sendToParents && <p style={{ fontSize: "0.8em", color: "#666", marginTop: "5px" }}>
        {emailCounts.parentCount} parent email{emailCounts.parentCount !== 1 ? 's' : ''} selected
      </p>}
      <br />
      <button
        style={{ marginTop: 10 }}
        onClick={() => handleButtonClick("app")}
      >
        Send Via Default Email Provider
      </button>
      <button onClick={() => handleButtonClick("clipboard")}>
        Copy Emails to Clipboard
      </button>
    </div>
  );
}

EmailComponent.propTypes = {
  data: PropTypes.arrayOf(PropTypes.array).isRequired,
};

export default EmailComponent;

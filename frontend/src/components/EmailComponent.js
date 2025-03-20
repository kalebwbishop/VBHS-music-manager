import React, { useState } from "react";
import PropTypes from "prop-types";

function EmailComponent({ data }) {
  const [sendToStudents, setSendToStudents] = useState(true);
  const [sendToParents, setSendToParents] = useState(true);

  const handleButtonClick = (method) => {
    let emailColumns = [];

    if (sendToStudents) {
      emailColumns.push("Student Email");
    }

    if (sendToParents) {
      emailColumns.push("Parent 1 email");
      emailColumns.push("Parent 2 email");
    }

    const emails = data.slice(1).map((row) => {
      return emailColumns.map((column) => {
        const columnIdx = data[0].indexOf(column);
        return row[columnIdx];
      });
    });

    if (method === "clipboard") {
      const emailString = emails.flat().join("; ");
      navigator.clipboard.writeText(emailString);
    } else if (method === "app") {
      const emailString = emails.flat().join(", ");
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
      <label>
        <input
          type="checkbox"
          value={sendToStudents}
          onChange={(e) => {
            setSendToStudents(e.target.checked);
          }}
        />{" "}
        Students
      </label>
      <br />
      <label>
        <input
          type="checkbox"
          value={sendToParents}
          onChange={(e) => {
            setSendToParents(e.target.checked);
          }}
        />{" "}
        Parents
      </label>
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

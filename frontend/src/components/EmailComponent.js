import React, { useState, useMemo, useEffect } from "react";
import PropTypes from "prop-types";

function EmailComponent({ data, accessToken }) {
  const [sendToStudents, setSendToStudents] = useState(true);
  const [sendToParents, setSendToParents] = useState(true);
  const [sendToDirectors, setSendToDirectors] = useState(false);
  const [sendToOther, setSendToOther] = useState(false);
  const [extraEmails, setExtraEmails] = useState({ directorEmails: [], otherEmails: [] });
  const [newEmail, setNewEmail] = useState({ director: "", other: "" });
  const [selectedEmails, setSelectedEmails] = useState({ director: [], other: [] });

  useEffect(() => {
    const fetchExtraEmails = async () => {
      try {
        const response = await fetch(`${window.env.REACT_APP_BACKEND_URL}/api/extra-emails`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const data = await response.json();
        setExtraEmails(data);
        // Set all emails as selected by default
        setSelectedEmails({
          director: [...data.directorEmails],
          other: [...data.otherEmails]
        });
      } catch (error) {
        console.error('Error fetching extra emails:', error);
      }
    };

    fetchExtraEmails();
  }, [accessToken]);

  const updateEmailLists = async (updatedLists) => {
    try {
      const response = await fetch(`${window.env.REACT_APP_BACKEND_URL}/api/extra-emails`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(updatedLists),
      });
      const data = await response.json();
      setExtraEmails(data);
      // Update selected emails to include any new emails
      setSelectedEmails(prev => ({
        director: [...new Set([...prev.director, ...data.directorEmails])],
        other: [...new Set([...prev.other, ...data.otherEmails])]
      }));
    } catch (error) {
      console.error('Error updating email lists:', error);
    }
  };

  const handleAddEmail = (type) => {
    const email = newEmail[type].trim();
    if (!email) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Please enter a valid email address');
      return;
    }

    const updatedLists = {
      ...extraEmails,
      [type === 'director' ? 'directorEmails' : 'otherEmails']: [
        ...extraEmails[type === 'director' ? 'directorEmails' : 'otherEmails'],
        email
      ]
    };

    updateEmailLists(updatedLists);
    setNewEmail({ ...newEmail, [type]: "" });
  };

  const handleRemoveEmail = (type, emailToRemove) => {
    const updatedLists = {
      ...extraEmails,
      [type === 'director' ? 'directorEmails' : 'otherEmails']: 
        extraEmails[type === 'director' ? 'directorEmails' : 'otherEmails'].filter(email => email !== emailToRemove)
    };

    updateEmailLists(updatedLists);
    // Also remove from selected emails if it was selected
    setSelectedEmails({
      ...selectedEmails,
      [type]: selectedEmails[type].filter(email => email !== emailToRemove)
    });
  };

  const handleEmailSelection = (type, email) => {
    setSelectedEmails(prev => {
      const currentList = prev[type];
      const newList = currentList.includes(email)
        ? currentList.filter(e => e !== email)
        : [...currentList, email];
      
      return {
        ...prev,
        [type]: newList
      };
    });
  };

  const handleSelectAll = (type) => {
    setSelectedEmails(prev => ({
      ...prev,
      [type]: [...extraEmails[type === 'director' ? 'directorEmails' : 'otherEmails']]
    }));
  };

  const handleDeselectAll = (type) => {
    setSelectedEmails(prev => ({
      ...prev,
      [type]: []
    }));
  };

  const emailCounts = useMemo(() => {
    let studentCount = 0;
    let parentCount = 0;
    let directorCount = 0;
    let otherCount = 0;

    if (data && data.rows) {
      if (sendToStudents) {
        studentCount = data.rows.filter(row => row["Student Email"]).length;
      }
      if (sendToParents) {
        parentCount = data.rows.filter(row => row["Parent 1 Email"] || row["Parent 2 Email"]).length;
      }
      if (sendToDirectors) {
        directorCount = selectedEmails.director.length;
      }
      if (sendToOther) {
        otherCount = selectedEmails.other.length;
      }
    }

    return { studentCount, parentCount, directorCount, otherCount };
  }, [data, sendToStudents, sendToParents, sendToDirectors, sendToOther, selectedEmails]);

  const handleButtonClick = (method) => {
    let emails = [];

    if (sendToStudents) {
      emails = emails.concat(data.rows.map(row => row["Student Email"]).filter(Boolean));
    }

    if (sendToParents) {
      emails = emails.concat(
        data.rows.map(row => [row["Parent 1 Email"], row["Parent 2 Email"]]).flat().filter(Boolean)
      );
    }

    if (sendToDirectors) {
      emails = emails.concat(selectedEmails.director);
    }

    if (sendToOther) {
      emails = emails.concat(selectedEmails.other);
    }

    if (emails.length === 0) {
      alert("No emails selected to send. Please check your selections.");
      return;
    }

    if (method === "clipboard") {
      const emailString = emails.join("; ");
      navigator.clipboard.writeText(emailString);
    } else if (method === "app") {
      const emailString = emails.join(", ");
      const subject = "";
      const body = "";
      const mailto = `mailto:?cc=${emailString}&subject=${encodeURIComponent(
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
        <label style={{ 
          display: 'flex', 
          alignItems: 'center',
          cursor: 'pointer',
          userSelect: 'none'
        }}>
          <input
            type="checkbox"
            checked={sendToDirectors}
            onChange={(e) => setSendToDirectors(e.target.checked)}
            style={{
              width: '18px',
              height: '18px',
              marginRight: '10px',
              cursor: 'pointer',
              accentColor: '#4a90e2'
            }}
          />
          <span style={{ fontSize: '16px' }}>Directors</span>
        </label>
        <label style={{ 
          display: 'flex', 
          alignItems: 'center',
          cursor: 'pointer',
          userSelect: 'none'
        }}>
          <input
            type="checkbox"
            checked={sendToOther}
            onChange={(e) => setSendToOther(e.target.checked)}
            style={{
              width: '18px',
              height: '18px',
              marginRight: '10px',
              cursor: 'pointer',
              accentColor: '#4a90e2'
            }}
          />
          <span style={{ fontSize: '16px' }}>Other</span>
        </label>
      </div>
      
      {sendToStudents && <p style={{ fontSize: "0.8em", color: "#666", marginTop: "5px" }}>
        {emailCounts.studentCount} student email{emailCounts.studentCount !== 1 ? 's' : ''} selected
      </p>}
      {sendToParents && <p style={{ fontSize: "0.8em", color: "#666", marginTop: "5px" }}>
        {emailCounts.parentCount} parent email{emailCounts.parentCount !== 1 ? 's' : ''} selected
      </p>}
      {sendToDirectors && <p style={{ fontSize: "0.8em", color: "#666", marginTop: "5px" }}>
        {emailCounts.directorCount} director email{emailCounts.directorCount !== 1 ? 's' : ''} selected
      </p>}
      {sendToOther && <p style={{ fontSize: "0.8em", color: "#666", marginTop: "5px" }}>
        {emailCounts.otherCount} other email{emailCounts.otherCount !== 1 ? 's' : ''} selected
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

      <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #ccc', borderRadius: '5px' }}>
        <h4>Manage Email Lists</h4>
        
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h5 style={{ margin: 0 }}>Director Emails</h5>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => handleSelectAll('director')}
                style={{ padding: '2px 8px', fontSize: '0.9em' }}
              >
                Select All
              </button>
              <button 
                onClick={() => handleDeselectAll('director')}
                style={{ padding: '2px 8px', fontSize: '0.9em' }}
              >
                Deselect All
              </button>
            </div>
          </div>
          <div style={{ maxHeight: '150px', overflowY: 'auto', marginBottom: '10px' }}>
            {extraEmails.directorEmails.map((email, index) => (
              <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', flex: 1 }}>
                  <input
                    type="checkbox"
                    checked={selectedEmails.director.includes(email)}
                    onChange={() => handleEmailSelection('director', email)}
                    style={{ marginRight: '10px' }}
                  />
                  <span>{email}</span>
                </label>
                <button 
                  onClick={() => handleRemoveEmail('director', email)}
                  style={{ marginLeft: '10px', padding: '2px 8px' }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="email"
              value={newEmail.director}
              onChange={(e) => setNewEmail({ ...newEmail, director: e.target.value })}
              placeholder="Enter director email"
              style={{ padding: '5px', flex: 1 }}
            />
            <button onClick={() => handleAddEmail('director')}>Add New</button>
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h5 style={{ margin: 0 }}>Other Emails</h5>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => handleSelectAll('other')}
                style={{ padding: '2px 8px', fontSize: '0.9em' }}
              >
                Select All
              </button>
              <button 
                onClick={() => handleDeselectAll('other')}
                style={{ padding: '2px 8px', fontSize: '0.9em' }}
              >
                Deselect All
              </button>
            </div>
          </div>
          <div style={{ maxHeight: '150px', overflowY: 'auto', marginBottom: '10px' }}>
            {extraEmails.otherEmails.map((email, index) => (
              <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', flex: 1 }}>
                  <input
                    type="checkbox"
                    checked={selectedEmails.other.includes(email)}
                    onChange={() => handleEmailSelection('other', email)}
                    style={{ marginRight: '10px' }}
                  />
                  <span>{email}</span>
                </label>
                <button 
                  onClick={() => handleRemoveEmail('other', email)}
                  style={{ marginLeft: '10px', padding: '2px 8px' }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="email"
              value={newEmail.other}
              onChange={(e) => setNewEmail({ ...newEmail, other: e.target.value })}
              placeholder="Enter other email"
              style={{ padding: '5px', flex: 1 }}
            />
            <button onClick={() => handleAddEmail('other')}>Add New</button>
          </div>
        </div>
      </div>
    </div>
  );
}

EmailComponent.propTypes = {
  data: PropTypes.arrayOf(PropTypes.array).isRequired,
  accessToken: PropTypes.string.isRequired,
};

export default EmailComponent;

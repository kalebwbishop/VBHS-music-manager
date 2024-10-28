import React, { useEffect, useState } from "react";
import { gapi } from "gapi-script";

import EmailComponent from "./EmailComponent";
import Popup from "./Popup";

import styles from "./GoogleSheetComponent.module.css";

const CLIENT_ID = process.env.REACT_APP_CLIENT_ID;
const API_KEY = process.env.REACT_APP_API_KEY;
const SCOPES = "https://www.googleapis.com/auth/spreadsheets.readonly";
const SHEET_ID = process.env.REACT_APP_SHEET_ID;
const RANGE = "Sheet1!A1:Z1000";

const GoogleSheetComponent = () => {
  const [data, setData] = useState(null);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupContent, setPopupContent] = useState("");

  useEffect(() => {
    const initClient = () => {
      gapi.client
        .init({
          apiKey: API_KEY,
          clientId: CLIENT_ID,
          scope: SCOPES,
          discoveryDocs: [
            "https://sheets.googleapis.com/$discovery/rest?version=v4",
          ],
        })
        .then(() => {
          const authInstance = gapi.auth2.getAuthInstance();
          setIsSignedIn(authInstance.isSignedIn.get());
          // if (authInstance.isSignedIn.get()) {
          if (false) {
            loadSheetData();
          } else {
            authInstance.signIn().then(loadSheetData);
          }
        });
    };

    gapi.load("client:auth2", initClient);
  }, []);

  const loadSheetData = () => {
    gapi.client.sheets.spreadsheets.values
      .get({
        spreadsheetId: SHEET_ID,
        range: RANGE,
      })
      .then((response) => {
        setData(response.result.values);
      })
      .catch((error) => {
        console.error("Error loading data from sheet:", error);
      });
  };

  const handleButtonClick = (content) => {
    setPopupContent(content);
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
    setPopupContent("");
  };

  // console.log(
  //   data.slice(1).map((sublist) => (sublist.length > 0 ? sublist[3] : null))
  // );

  return (
    <div>
      {isSignedIn && data ? (
        <div>
          <h2>VBHS Music Manager</h2>
          <button onClick={() => handleButtonClick("Filter Options")}>
            Filter
          </button>
          <button onClick={() => handleButtonClick("Email Options")}>
            Email
          </button>
          <button onClick={() => handleButtonClick("Export Options")}>
            Export
          </button>
          <button>
            Columns
          </button>
          <table className={styles.table}>
            <thead>
              <tr>
                {data[0] &&
                  data[0].map((header, index) => (
                    <th key={index} className={styles.header}>
                      {header}
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody>
              {data.slice(1).map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className={styles.cell}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          <Popup
            showPopup={showPopup}
            popupContent={EmailComponent({ data })}
            closePopup={closePopup}
          />
        </div>
      ) : (
        <p>Signing in...</p>
      )}
    </div>
  );
};

export default GoogleSheetComponent;

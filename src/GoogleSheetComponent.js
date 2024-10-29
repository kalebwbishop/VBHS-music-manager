import React, { useEffect, useState, useRef } from "react";
import { gapi } from "gapi-script";
import EmailComponent from "./EmailComponent";
import ExportComponent from "./ExportComponent";
import FilterComponent from "./FilterComponent";
import styles from "./GoogleSheetComponent.module.css";

const CLIENT_ID = process.env.REACT_APP_CLIENT_ID;
const API_KEY = process.env.REACT_APP_API_KEY;
const SCOPES = "https://www.googleapis.com/auth/spreadsheets.readonly";
const SHEET_ID = process.env.REACT_APP_SHEET_ID;
const RANGE = "Sheet1!A1:Z1000";

const GoogleSheetComponent = () => {
  const [data, setData] = useState(null);
  const [filteredData, setFilteredData] = useState(null);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [sidebarContent, setSidebarContent] = useState("");

  const headerRef = useRef(null);

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
          if (authInstance.isSignedIn.get()) {
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
        setFilteredData(response.result.values);
      })
      .catch((error) => {
        console.error("Error loading data from sheet:", error);
      });
  };

  const handleButtonClick = (content) => {
    setSidebarContent(content);
    setShowSidebar(true);
  };

  const closeSidebar = () => {
    setShowSidebar(false);
    setSidebarContent("");
  };

  return (
    <div
      className={`${styles.container} ${
        showSidebar ? styles.containerSidebarOpen : ""
      }`}
    >
      {isSignedIn && data ? (
        <div>
          <div ref={headerRef} className={styles.headerContainer}>
            <h2 className={styles.headerTitle}>VBHS Music Manager</h2>
            <div className={styles.buttonGroup}>
              <button
                onClick={() =>
                  handleButtonClick(
                    <FilterComponent
                      data={data}
                      setFilteredData={setFilteredData}
                    />
                  )
                }
              >
                Filter
              </button>
              <button
                onClick={() =>
                  handleButtonClick(<EmailComponent data={filteredData} />)
                }
              >
                Email
              </button>
              <button
                onClick={() =>
                  handleButtonClick(<ExportComponent data={filteredData} />)
                }
              >
                Export
              </button>
            </div>
          </div>
          <div
            className={styles.tableContainer}
            style={{
              maxHeight: `calc(95vh - ${
                headerRef?.current?.offsetHeight || 0
              }px)`,
            }}
          >
            <table className={styles.table}>
              <thead>
                <tr>
                  {filteredData[0] &&
                    filteredData[0].map((header, index) => (
                      <th key={index} className={styles.header}>
                        {header}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {filteredData.slice(1).map((row, rowIndex) => (
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
          </div>
          {/* Sidebar Component */}
          <div
            className={`${styles.sidebar} ${showSidebar ? styles.show : ""}`}
          >
            <button className={styles.closeButton} onClick={closeSidebar}>
              ×
            </button>
            <div className={styles.sidebarContent}>{sidebarContent}</div>
          </div>
        </div>
      ) : (
        <p>Signing in...</p>
      )}
    </div>
  );
};

export default GoogleSheetComponent;

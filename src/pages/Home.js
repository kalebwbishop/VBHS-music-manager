import React, { useEffect, useState, useRef } from "react";
import { gapi } from "gapi-script";
import PropTypes from "prop-types";

import StudentSearch from "../components/StudentSearch";
import SettingsComponent from "../components/SettingsComponent";
import EmailExportComponent from "../components/EmailExportComponent";

import MultiStepSidebar from "../components/MultiStepSidebar";

import styles from "./Home.module.css";
import combineSheets from "../utils/combineSheets";
import { set } from "../features/settings/SettingsSlice";

const CLIENT_ID = process.env.REACT_APP_CLIENT_ID;
const CLIENT_SECRET = process.env.REACT_APP_CLIENT_SECRET;
const SCOPES = "https://www.googleapis.com/auth/spreadsheets.readonly";
const SHEET_ID = process.env.REACT_APP_SHEET_ID;

const Home = () => {
  const [allData, setAllData] = useState([]);
  const [data, setData] = useState([]);
  const [displayData, setDisplayData] = useState([]);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [sidebarContent, setSidebarContent] = useState("");
  const [sidebarTitle, setSidebarTitle] = useState("");
  const [sidebarContentIndex, setSidebarContentIndex] = useState(0);
  const [sheetNames, setSheetNames] = useState([]);
  const [selectedSheetIdx, setSelectedSheetIdx] = useState(-1);

  const headerRef = useRef(null);
  const sheetButtonsRef = useRef(null);

  const initClient = () => {
    gapi.client
      .init({
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        scope: SCOPES,
        discoveryDocs: [
          "https://sheets.googleapis.com/$discovery/rest?version=v4",
        ],
      })
      .then(() => {
        const authInstance = gapi.auth2.getAuthInstance();
        const isUserSignedIn = authInstance.isSignedIn.get();

        setIsSignedIn(isUserSignedIn);

        if (isUserSignedIn) {
          loadSheetData();
        } else {
          authInstance.signIn().then(() => {
            setIsSignedIn(true);
            loadSheetData();
          });
        }
      });
  };

  useEffect(() => {
    gapi.load("client:auth2", initClient);
  }, []);

  useEffect(() => {
    if (allData) {
      if (selectedSheetIdx === -1) {
        setData(combineSheets(allData));
        setDisplayData(combineSheets(allData));
      } else if (selectedSheetIdx !== -2) {
        setData(allData[selectedSheetIdx]);
        setDisplayData(allData[selectedSheetIdx]);
      }
    }
  }, [selectedSheetIdx, allData]);

  const loadSheetData = () => {
    gapi.client.sheets.spreadsheets
      .get({
        spreadsheetId: SHEET_ID,
      })
      .then((response) => {
        const sheets = response.result.sheets;
        const sheetNames = sheets.map((sheet) => sheet.properties.title);

        setSheetNames(sheetNames);

        return Promise.all(
          sheetNames.map((sheetName) => loadSheetDataPage(sheetName))
        );
      })
      .then((allData) => {
        setAllData(allData);
      })
      .catch((error) => {
        console.error("Error loading sheets metadata:", error);
      });
  };

  const loadSheetDataPage = (sheetName) => {
    return gapi.client.sheets.spreadsheets.values
      .get({
        spreadsheetId: SHEET_ID,
        range: sheetName,
      })
      .then((response) => response.result.values)
      .catch((error) => {
        console.error("Error loading data from sheet:", error);
        return [];
      });
  };

  const handleButtonClick = (content) => {
    setSidebarContent(content);
    setShowSidebar(true);
  };

  const closeSidebar = () => {
    setShowSidebar(false);
    setSidebarContent("");
    setSidebarContentIndex(0);
  };

  return (
    <div
      className={`${styles.container} ${
        showSidebar ? styles.containerSidebarOpen : ""
      }`}
    >
      {isSignedIn ? (
        <div>
          <div ref={headerRef} className={styles.headerContainer}>
            <h2 className={styles.headerTitle}>VBHS Music Manager</h2>
            <div className={styles.buttonGroup}>
              <StudentSearch
                data={data}
                setDisplayData={setDisplayData}
                sidebarContentIndex={sidebarContentIndex}
              />
              <button
                onClick={() => {
                  setSelectedSheetIdx(-2);
                  handleButtonClick(
                    <EmailExportComponent
                      allData={allData}
                      data={data}
                      setDisplayData={setDisplayData}
                      sheetNames={sheetNames}
                    />
                  );
                  setSidebarTitle("Email/Export");
                  setSidebarContentIndex(1);
                }}
              >
                Email/Export
              </button>
              <button
                onClick={() => {
                  handleButtonClick(<SettingsComponent data={allData} />);
                  setSidebarTitle("Settings");
                  setSidebarContentIndex(2);
                }}
              >
                Settings
              </button>
            </div>
          </div>
          <div
            className={styles.tableContainer}
            style={{
              maxHeight: `calc(95vh - ${
                headerRef?.current?.offsetHeight || 0
              }px - ${sheetButtonsRef?.current?.offsetHeight || 0}px)`,
              minHeight: `calc(95vh - ${
                headerRef?.current?.offsetHeight || 0
              }px - ${sheetButtonsRef?.current?.offsetHeight || 0}px)`,
            }}
          >
            {displayData.length === 0 ||
              (displayData[0].length === 0 && <p>No data to display</p>)}
            <table className={styles.table}>
              <thead>
                <tr>
                  {displayData[0]?.map((header, index) => (
                    <th key={`${header}-${index}`} className={styles.header}>
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayData.slice(1).map((row) => (
                  <tr key={row.join("-")}>
                    {row.map((cell, cellIndex) => (
                      <td
                        key={`${row.join("-")}-${cellIndex}`}
                        className={styles.cell}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          {sidebarContentIndex !== 1 && (
            <SheetButtons
              sheetNames={sheetNames}
              selectedSheetIdx={selectedSheetIdx}
              setSelectedSheetIdx={setSelectedSheetIdx}
              sheetButtonsRef={sheetButtonsRef}
            />
          )}

          {/* Sidebar Component */}
          <MultiStepSidebar
            title={sidebarTitle}
            sidebarContent={sidebarContent}
            showSidebar={showSidebar}
            closeSidebar={closeSidebar}
          />
        </div>
      ) : (
        <p>Signing in...</p>
      )}
    </div>
  );
};

const SheetButtons = ({
  sheetNames,
  selectedSheetIdx,
  setSelectedSheetIdx,
  sheetButtonsRef,
}) => {
  return (
    <div ref={sheetButtonsRef}>
      <button
        key={"all-sheets-button"}
        className={`${styles.sheetButton} ${
          selectedSheetIdx === -1 ? styles.active : ""
        }`}
        onClick={() => {
          setSelectedSheetIdx(-1);
        }}
      >
        All Sheets
      </button>
      {sheetNames.map((sheetName, idx) => (
        <button
          key={sheetName}
          className={`${styles.sheetButton} ${
            selectedSheetIdx === idx ? styles.active : ""
          }`}
          onClick={() => {
            setSelectedSheetIdx(idx);
          }}
        >
          {sheetName}
        </button>
      ))}
    </div>
  );
};

SheetButtons.propTypes = {
  sheetNames: PropTypes.array.isRequired,
  selectedSheetIdx: PropTypes.number.isRequired,
  setSelectedSheetIdx: PropTypes.func.isRequired,
  sheetButtonsRef: PropTypes.object.isRequired,
};

export default Home;

import React, { useEffect, useState, useRef } from "react";
import PropTypes from "prop-types";

import StudentSearch from "../components/StudentSearch";
// import SettingsComponent from "../components/SettingsComponent";
import EmailExportComponent from "../components/EmailExportComponent";
import AddStudentComponent from "../components/AddStudentComponent";
import ModifyStudentComponent from "../components/ModifyStudentComponent";
import AddSheetComponent from "../components/AddSheetComponent";
import EditSheetComponent from "../components/EditSheetComponent";
import AuthComponent from "../components/AuthComponent";

import MultiStepSidebar from "../components/MultiStepSidebar";

import styles from "./Home.module.css";
import combineSheets from "../utils/combineSheets";

const Home = () => {
  const [allData, setAllData] = useState([]);
  const [data, setData] = useState([]);
  const [displayData, setDisplayData] = useState([]);
  const [sheetIds, setSheetIds] = useState([]);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [sidebarContent, setSidebarContent] = useState("");
  const [sidebarTitle, setSidebarTitle] = useState("");
  const [sidebarContentIndex, setSidebarContentIndex] = useState(0);
  const [sheetNames, setSheetNames] = useState([]);
  const [selectedSheetIdx, setSelectedSheetIdx] = useState(-1);
  const [selectedRow, setSelectedRow] = useState(-1);
  const [refresh, setRefresh] = useState(false);
  const [accessToken, setAccessToken] = useState("");

  const headerRef = useRef(null);
  const sheetButtonsRef = useRef(null);

  useEffect(() => {
    const accessToken = localStorage.getItem("token");

    if (accessToken) {
      setAccessToken(accessToken);
      setIsSignedIn(true);
      loadSheetData(accessToken);
    }
    else {
      setIsSignedIn(false);
    }
  }, [refresh]);

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

  const loadSheetData = (accessToken) => {
    console.log("Loading sheet data...");
    fetch(
      `${window.env.REACT_APP_BACKEND_URL}/api/sheet`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )
      .then((response) => {
        if (response.status === 401) {
          console.error("Unauthorized access. Please sign in again.");
          setIsSignedIn(false);
          return;
        }
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        return response.json();
      })
      .then((data) => {
        console.log("Sheet data loaded successfully:", data);


        const sheetNames = Object.keys(data);
        const allData = sheetNames.map((sheetName) => {
          let headers = ["_id", ...data[sheetName].columns]
          console.log("Headers: ", headers);
          return [
            headers,
            ...data[sheetName].rows.map((row) =>
              headers.map((header) => row[header])
            ),
          ];
        });
        const sheetIds = sheetNames.map((sheetName) => data[sheetName]._id);

        setSheetNames(sheetNames);
        setAllData(allData);
        setSheetIds(sheetIds);
        console.log("Sheet Names: ", sheetNames);
        console.log("All Data: ", allData);
        console.log("Sheet IDs: ", sheetIds);
      })
      .catch((error) => {
        console.error("Error loading sheets metadata:", error);
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

    if (allData) {
      if (selectedSheetIdx === -1) {
        setData(combineSheets(allData));
        setDisplayData(combineSheets(allData));
      } else if (selectedSheetIdx !== -2) {
        setData(allData[selectedSheetIdx]);
        setDisplayData(allData[selectedSheetIdx]);
      }
    }
  };

  if (!isSignedIn) {
    return <AuthComponent setRefresh={setRefresh} />;
  }

  return (
    <div
      className={`${styles.container} ${showSidebar ? styles.containerSidebarOpen : ""
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
            </div>
          </div>
          <div
            className={styles.tableContainer}
            style={{
              maxHeight: `calc(95vh - ${headerRef?.current?.offsetHeight || 0
                }px - ${sheetButtonsRef?.current?.offsetHeight || 0}px)`,
              minHeight: `calc(95vh - ${headerRef?.current?.offsetHeight || 0
                }px - ${sheetButtonsRef?.current?.offsetHeight || 0}px)`,
            }}
          >
            {displayData.length === 0 ||
              (displayData[0].length === 0 && <p>No data to display</p>)}
            <table className={styles.table}>
              <thead>
                <tr>
                  {displayData[0]?.map(
                    (header, index) =>
                      !header.startsWith("_") && (
                        <th
                          key={`${header}-${index}`}
                          className={styles.header}
                        >
                          {header}
                        </th>
                      )
                  )}
                </tr>
              </thead>

              <tbody>
                {displayData.slice(1).map((row, rowIndex) => (
                  <tr
                    key={row.join("-")}
                    className={
                      selectedRow === rowIndex ? styles.selectedRow : styles.row
                    }
                    onClick={() => setSelectedRow(rowIndex)}
                  >
                    {row.map(
                      (cell, cellIndex) =>
                        // Skip the column if the corresponding header starts with an underscore
                        !displayData[0][cellIndex].startsWith("_") && (
                          <td
                            key={`${row.join("-")}-${cellIndex}`}
                            className={styles.cell}
                          >
                            {cell}
                          </td>
                        )
                    )}
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
              handleButtonClick={handleButtonClick}
              setSidebarTitle={setSidebarTitle}
              setSidebarContentIndex={setSidebarContentIndex}
              displayData={displayData}
              closeSidebar={closeSidebar}
              selectedRow={selectedRow}
              setDisplayData={setDisplayData}
              setSelectedRow={setSelectedRow}
              setRefresh={setRefresh}
              accessToken={accessToken}
              sheetIds={sheetIds}
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
  handleButtonClick,
  setSidebarTitle,
  setSidebarContentIndex,
  displayData,
  closeSidebar,
  selectedRow,
  setDisplayData,
  setSelectedRow,
  setRefresh,
  accessToken,
  sheetIds,
}) => {
  return (
    <div ref={sheetButtonsRef} className={styles.sheetButtonsContainer}>
      {/* Left-aligned buttons */}
      <div className={styles.sheetButtonGroup}>
        <button
          key={"all-sheets-button"}
          className={`${styles.sheetButton} ${selectedSheetIdx === -1 ? styles.active : ""
            }`}
          onClick={() => setSelectedSheetIdx(-1)}
          data-tooltip={selectedSheetIdx === -1 ? "Click to view all sheets" : ""}
        >
          All Sheets
        </button>
        {sheetNames.map((sheetName, idx) => (
          <button
            key={sheetName}
            className={`${styles.sheetButton} ${selectedSheetIdx === idx ? styles.active : ""
              }`}
            onClick={() => {
              if (selectedSheetIdx === idx) {
                handleButtonClick(
                  <EditSheetComponent
                    closeSidebar={closeSidebar}
                    setRefresh={setRefresh}
                    accessToken={accessToken}
                    sheetName={sheetName}
                    sheetId={sheetIds[idx]}
                    displayData={displayData}
                  />
                );
                setSidebarTitle("Edit Sheet");
                setSidebarContentIndex(2);
              }
              setSelectedSheetIdx(idx)
            }}
            data-tooltip={selectedSheetIdx === idx ? "Click again to edit sheet" : ""}
          >
            {sheetName}
          </button>
        ))}
        <button
          key={"add-sheet-button"}
          className={`${styles.sheetButton}`}
          onClick={() => {
            handleButtonClick(
              <AddSheetComponent
                closeSidebar={closeSidebar}
                setRefresh={setRefresh}
                accessToken={accessToken}
              />
            );
            setSidebarTitle("Add Sheet");
            setSidebarContentIndex(2);
          }}
          data-tooltip="Add new sheet"
        >
          +
        </button>
      </div>

      {/* Right-aligned buttons */}
      <div className={styles.rightButtons}>
        <button
          key="add-sheet-button"
          className={styles.sheetButton}
          disabled={selectedSheetIdx === -1}
          data-tooltip={selectedSheetIdx === -1 ? "Please select a specific sheet first" : ""}
          onClick={() => {
            handleButtonClick(
              <AddStudentComponent
                data={displayData}
                selectedSheetIdx={selectedSheetIdx}
                closeSidebar={closeSidebar}
                setRefresh={setRefresh}
                accessToken={accessToken}
                sheetIds={sheetIds}
              />
            );
            setSidebarTitle("Add Student");
            setSidebarContentIndex(4);
          }}
        >
          Add
        </button>
        <button
          key="modify-sheet-button"
          className={styles.sheetButton}
          disabled={selectedSheetIdx === -1 || selectedRow === -1}
          data-tooltip={
            selectedSheetIdx === -1 
              ? "Please select a specific sheet first" 
              : selectedRow === -1 
                ? "Please select a student first" 
                : ""
          }
          onClick={() => {
            handleButtonClick(
              <ModifyStudentComponent
                data={displayData}
                selectedSheetIdx={selectedSheetIdx}
                closeSidebar={closeSidebar}
                selectedRow={selectedRow}
                setRefresh={setRefresh}
                accessToken={accessToken}
                sheetId={sheetIds[selectedSheetIdx]}
              />
            );
            setSidebarTitle("Modify Student");
            setSidebarContentIndex(5);
          }}
        >
          Modify
        </button>
        <button
          key="delete-sheet-button"
          className={styles.sheetButton}
          disabled={selectedSheetIdx === -1 || selectedRow === -1}
          data-tooltip={
            selectedSheetIdx === -1 
              ? "Please select a specific sheet first" 
              : selectedRow === -1 
                ? "Please select a student first" 
                : ""
          }
          onClick={() => {
            // Handle delete logic here
            if (
              window.confirm("Are you sure you want to delete this student?")
            ) {
              fetch(
                `${window.env.REACT_APP_BACKEND_URL
                }/api/sheet/${sheetIds[selectedSheetIdx]}/${displayData[selectedRow + 1][0]
                }`,
                {
                  method: "DELETE",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                  },
                }
              )
                .then((response) => {
                  if (!response.ok) {
                    throw new Error("Network response was not ok");
                  }
                  return response.json();
                })
                .then((data) => {
                  console.log("Student deleted successfully:", data);
                  alert("Student deleted successfully!");
                  closeSidebar();
                  setSelectedRow(-1); // Reset selected row
                  setRefresh((prev) => !prev); // Trigger a refresh to update the data
                })
                .catch((error) => {
                  console.error("Error deleting student:", error);
                });
            }
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

SheetButtons.propTypes = {
  sheetNames: PropTypes.array.isRequired,
  selectedSheetIdx: PropTypes.number.isRequired,
  setSelectedSheetIdx: PropTypes.func.isRequired,
  sheetButtonsRef: PropTypes.object.isRequired,
  handleButtonClick: PropTypes.func.isRequired,
  setSidebarTitle: PropTypes.func.isRequired,
  setSidebarContentIndex: PropTypes.func.isRequired,
  displayData: PropTypes.array.isRequired,
  closeSidebar: PropTypes.func.isRequired,
  selectedRow: PropTypes.number,
  setDisplayData: PropTypes.func.isRequired,
  setSelectedRow: PropTypes.func.isRequired,
  setRefresh: PropTypes.func.isRequired,
  accessToken: PropTypes.string.isRequired,
  sheetIds: PropTypes.array.isRequired,
};

export default Home;

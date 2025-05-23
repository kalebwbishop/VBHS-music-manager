import React, { useEffect, useState, useRef } from "react";
import PropTypes from "prop-types";
import { getJSONCookie, setJSONCookie } from "../utils/cookieUtils";

import AuthComponent from "../components/AuthComponent";
import StudentSearch from "../components/StudentSearch";
import EmailExportComponent from "../components/EmailExportComponent";
import AddStudentComponent from "../components/AddStudentComponent";
import ModifyStudentComponent from "../components/ModifyStudentComponent";
import AddSheetComponent from "../components/AddSheetComponent";
import EditSheetComponent from "../components/EditSheetComponent";
import MultiStepSidebar from "../components/MultiStepSidebar";

import styles from "./Home.module.css";

const Home = () => {
  const [data, setData] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [displayData, setDisplayData] = useState([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [sidebarContent, setSidebarContent] = useState("");
  const [sidebarTitle, setSidebarTitle] = useState("");
  const [selectedSheetId, setSelectedSheetId] = useState('all-sheets');
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const [accessToken, setAccessToken] = useState("");

  const headerRef = useRef(null);
  const sheetButtonsRef = useRef(null);


  useEffect(() => {
    if (data && data.length > 0) {
      // Find the sheet that matches the selectedSheetId
      const sheet = data.find(sheet => sheet._id === selectedSheetId);
      if (sheet) {
        if (searchValue === "") {
          setDisplayData(sheet);
        }
      } else {
        setDisplayData(data[0]);
      }
    }
  }, [data, selectedSheetId]);

  const loadSheetData = (accessToken) => {
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
          setAccessToken("");
          return;
        }
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        return response.json();
      })
      .then((data) => {
        if (!data) {
          console.error("No data returned from server");
          return;
        }
        const combinedData = {
          name: "All Sheets",
          _id: "all-sheets",
          columns: [],
          rows: []
        };

        data.forEach((sheet) => {
          // Push only unique columns
          sheet.columns.forEach((column) => {
            if (!combinedData.columns.includes(column)) {
              combinedData.columns.push(column);
            }
          });
        });

        // Create a map to store unique students by first and last name
        const studentMap = new Map();

        // Process all sheets to combine student data
        data.forEach((sheet) => {
          sheet.rows.forEach((row) => {
            const firstName = row["Student First"] || "";
            const lastName = row["Student Last"] || "";
            const studentKey = `${firstName.toLowerCase()}-${lastName.toLowerCase()}`;

            if (studentMap.has(studentKey)) {
              // Merge with existing student data
              const existingStudent = studentMap.get(studentKey);
              combinedData.columns.forEach(column => {
                if (row[column] && !existingStudent[column]) {
                  existingStudent[column] = row[column];
                }
              });
            } else {
              // Add new student
              const newStudent = { ...row };
              studentMap.set(studentKey, newStudent);
            }
          });
        });

        // Convert the map values to an array for the combined rows
        combinedData.rows = Array.from(studentMap.values());

        // Get the saved sheet order from cookies
        const sheetOrder = getJSONCookie("sheetOrder") || [];

        // If we have a saved order, use it to sort the sheets
        if (sheetOrder.length > 0) {
          const orderedSheets = [...data];
          orderedSheets.sort((a, b) => {
            const aIndex = sheetOrder.findIndex(order => order.id === a._id);
            const bIndex = sheetOrder.findIndex(order => order.id === b._id);
            if (aIndex === -1) return 1;
            if (bIndex === -1) return -1;
            return aIndex - bIndex;
          });
          setData([combinedData, ...orderedSheets]);
        } else {
          // If no saved order, use the default order and save it
          const initialOrder = data.map((sheet, index) => ({ id: sheet._id, position: index }));
          setJSONCookie("sheetOrder", initialOrder);
          setData([combinedData, ...data]);
        }


        if (data.find(sheet => sheet._id === selectedSheetId)) {
          setDisplayData(data.find(sheet => sheet._id === selectedSheetId));
        } else {
          setSelectedSheetId("all-sheets");
          setDisplayData(combinedData);
        }

      })
      .catch((error) => {
        console.error("Error loading sheets metadata:", error);
      });
  };

  const openSidebar = (content) => {
    setSidebarContent(content);
    setShowSidebar(true);
  };

  const closeSidebar = () => {
    setShowSidebar(false);
    setSidebarContent("");
    setRefresh((prev) => !prev);

    // if (data) {
    //   const sheetIndex = data.findIndex(sheet => sheet._id === selectedSheetId);
    //   if (sheetIndex !== -1) {
    //     setDisplayData(data[sheetIndex]);
    //   }
    //   else {
    //     setDisplayData(data[0]);
    //   }
    // }
  };

  useEffect(() => {
    const accessToken = localStorage.getItem("token");

    if (accessToken) {
      setAccessToken(accessToken);
      loadSheetData(accessToken);
    }
  }, [refresh]);

  if (!accessToken || data.length === 0) {
    return <AuthComponent setRefresh={setRefresh} />;
  }

  return (
    <div
      className={`${styles.container} ${showSidebar ? styles.containerSidebarOpen : ""}`}
    >
      {accessToken ? (
        <div style={{ display: 'flex', flexDirection: 'column', height: '95%' }}>
          <div ref={headerRef} className={styles.headerContainer}>
            <h2 className={styles.headerTitle}>VBHS Music Manager</h2>
            <div className={styles.buttonGroup}>
              {!showSidebar && (
                <>
                  <StudentSearch
                    data={data}
                    selectedSheetId={selectedSheetId}
                    setDisplayData={setDisplayData}
                    setSearchValue={setSearchValue}
                    searchValue={searchValue}
                  />

                  <button
                    onClick={() => {
                      openSidebar(
                        <EmailExportComponent
                          data={data}
                          setDisplayData={setDisplayData}
                          accessToken={accessToken}
                        />
                      );
                      setSidebarTitle("Email/Export");
                    }}
                    style={{
                      padding: "5px 10px",
                      backgroundColor: "#6c757d",
                      color: "white",
                      border: "none",
                      borderRadius: "5px",
                      cursor: "pointer",
                      marginTop: "5px"
                    }}
                  >
                    Email/Export
                  </button>
                </>
              )}
            </div>
          </div>
          <div
            className={`${styles.tableContainer} ${showSidebar ? styles.tableContainerSidebarOpen : ""}`}
            style={{
              height: `calc(100vh - ${headerRef?.current?.offsetHeight || 0}px - ${sheetButtonsRef?.current?.offsetHeight || 0}px)`,
            }}
          >
            {displayData?.columns?.length === 0 ? <p>No data to display</p> : (<table className={styles.table}>
              <thead>
                <tr>
                  {displayData.columns.map(
                    (column, index) =>
                      !column.startsWith("_") && (
                        <th
                          key={`${column}-${index}`}
                          className={styles.header}
                        >
                          {column}
                        </th>
                      )
                  )}
                </tr>
              </thead>

              <tbody>
                {displayData.rows.map((row, rowIndex) => (
                  <tr
                    key={row._id}
                    className={
                      selectedRowId === row._id ? styles.selectedRow : styles.row
                    }
                    onClick={() => setSelectedRowId(row._id)}
                  >
                    {displayData.columns.map(
                      (column) =>
                        // Skip the column if the corresponding header starts with an underscore
                        !column.startsWith("_") && (
                          <td
                            key={`${row._id}-${column}`}
                            className={styles.cell}
                          >
                            {row[column]}
                          </td>
                        )
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            )}
          </div>

          {/* Footer */}
          {!showSidebar && (
            <SheetButtons
              data={data}
              setData={setData}
              selectedSheetId={selectedSheetId}
              setSelectedSheetId={setSelectedSheetId}
              sheetButtonsRef={sheetButtonsRef}
              handleButtonClick={openSidebar}
              setSidebarTitle={setSidebarTitle}
              displayData={displayData}
              closeSidebar={closeSidebar}
              selectedRowId={selectedRowId}
              setDisplayData={setDisplayData}
              setSelectedRowId={setSelectedRowId}
              setRefresh={setRefresh}
              accessToken={accessToken}
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
  data,
  setData,
  selectedSheetId,
  setSelectedSheetId,
  sheetButtonsRef,
  handleButtonClick,
  setSidebarTitle,
  displayData,
  closeSidebar,
  selectedRowId,
  setDisplayData,
  setSelectedRowId,
  setRefresh,
  accessToken,
}) => {
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dropTargetIndex, setDropTargetIndex] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.target.style.opacity = '0.5';
    // Add a custom data attribute to identify the dragged item
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragEnd = (e) => {
    setDraggedIndex(null);
    setDropTargetIndex(null);
    setIsDragging(false);
    e.target.style.opacity = '1';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (index !== dropTargetIndex) {
      setDropTargetIndex(index);
    }
  };

  const handleDragLeave = (e, index) => {
    if (dropTargetIndex === index) {
      setDropTargetIndex(null);
    }
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    const draggedIndex = parseInt(e.dataTransfer.getData('text/plain'));

    if (draggedIndex === null || draggedIndex === index) {
      setDropTargetIndex(null);
      return;
    }

    // Reorder the data array (skip the first element which is "All Sheets")
    const newData = [...data];
    const [movedSheet] = newData.splice(draggedIndex, 1);

    // Adjust the target index if we're moving an item forward
    // For the final slot (data.length), we want to insert at the end
    const adjustedIndex = index === data.length ? data.length - 1 :
      draggedIndex < index ? index - 1 : index;
    newData.splice(adjustedIndex, 0, movedSheet);

    // Update the sheet order in cookies (skip the first element which is "All Sheets")
    const sheetOrder = newData.slice(1).map((sheet, idx) => ({
      id: sheet._id,
      position: idx
    }));
    setJSONCookie("sheetOrder", sheetOrder);

    // Update "All Sheets" to reflect the new order
    const allSheets = newData[0];
    // Get all unique columns from all sheets
    const allColumns = new Set();
    newData.slice(1).forEach(sheet => {
      sheet.columns.forEach(column => {
        if (!column.startsWith('_')) {
          allColumns.add(column);
        }
      });
    });
    allSheets.columns = Array.from(allColumns);

    // Update rows to ensure they have all columns
    allSheets.rows = newData.slice(1).flatMap(sheet => {
      return sheet.rows.map(row => {
        const newRow = { ...row };
        // Ensure each row has all columns, filling with empty string if missing
        allSheets.columns.forEach(column => {
          if (!(column in newRow)) {
            newRow[column] = '';
          }
        });
        return newRow;
      });
    });

    // Update the data state to reflect the new order
    setData(newData);
    setDropTargetIndex(null);
  };

  return (
    <div ref={sheetButtonsRef} className={styles.sheetButtonsContainer}>
      <div className={styles.sheetButtonGroup}>
        <button
          key={"all-sheets-button"}
          className={`${styles.sheetButton} ${selectedSheetId === 'all-sheets' ? styles.active : ""}`}
          onClick={() => setSelectedSheetId('all-sheets')}
          data-tooltip={selectedSheetId === 'all-sheets' ? "Click to view all sheets" : ""}
        >
          All Sheets
        </button>
        {data.map((sheet, idx) => {
          if (idx === 0) return null;
          return (
            <React.Fragment key={sheet._id}>
              {dropTargetIndex === idx && (
                <div
                  className={styles.dropIndicator}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDragLeave={(e) => handleDragLeave(e, idx)}
                  onDrop={(e) => handleDrop(e, idx)}
                />
              )}
              <button
                draggable
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDragLeave={(e) => handleDragLeave(e, idx)}
                onDrop={(e) => handleDrop(e, idx)}
                className={`${styles.sheetButton} 
                  ${selectedSheetId === sheet._id ? styles.active : ""} 
                  ${draggedIndex === idx ? styles.dragging : ""}
                  ${isDragging ? styles.dragActive : ""}`}
                onClick={() => {
                  if (selectedSheetId === sheet._id) {
                    handleButtonClick(
                      <EditSheetComponent
                        closeSidebar={closeSidebar}
                        accessToken={accessToken}
                        sheetName={sheet.name}
                        sheetId={sheet._id}
                        displayData={displayData}
                        setSelectedSheetId={setSelectedSheetId}
                      />
                    );
                    setSidebarTitle("Edit Sheet");
                  }
                  setSelectedSheetId(sheet._id);
                }}
                data-tooltip={selectedSheetId === sheet._id ? "Click again to edit sheet" : "Drag to reorder"}
                style={{
                  cursor: 'grab',
                  position: 'relative',
                  transition: 'transform 0.2s ease, opacity 0.2s ease'
                }}
              >
                {sheet.name}
                <span style={{
                  position: 'absolute',
                  right: '5px',
                  opacity: '0.5',
                  fontSize: '12px',
                  pointerEvents: 'none'
                }}>⋮⋮</span>
              </button>
            </React.Fragment>
          );
        })}

        {/* Add drop zone between last sheet and add button */}
        {dropTargetIndex === data.length && (
          <div
            className={styles.dropIndicator}
            onDragOver={(e) => handleDragOver(e, data.length)}
            onDragLeave={(e) => handleDragLeave(e, data.length)}
            onDrop={(e) => handleDrop(e, data.length)}
          />
        )}

        <button
          key={"add-sheet-button"}
          className={`${styles.sheetButton}`}
          onClick={() => {
            handleButtonClick(
              <AddSheetComponent
                closeSidebar={closeSidebar}
                accessToken={accessToken}
                setDisplayData={setDisplayData}
                setSelectedSheetId={setSelectedSheetId}
              />
            );
            setSidebarTitle("Add Sheet");
          }}
          data-tooltip="Add new sheet"
        >
          +
        </button>
      </div>

      <div className={styles.rightButtons}>
        <button
          key="add-sheet-button"
          className={styles.sheetButton}
          disabled={selectedSheetId === "all-sheets"}
          data-tooltip={selectedSheetId === "all-sheets" ? "Please select a specific sheet first" : ""}
          onClick={() => {
            handleButtonClick(
              <AddStudentComponent
                data={data}
                selectedSheetId={selectedSheetId}
                closeSidebar={closeSidebar}
                setRefresh={setRefresh}
                accessToken={accessToken}
                setDisplayData={setDisplayData}
              />
            );
            setSidebarTitle("Add Student");
          }}
        >
          Add
        </button>
        <button
          key="modify-sheet-button"
          className={styles.sheetButton}
          disabled={selectedSheetId === 'all-sheets' || selectedRowId === null}
          data-tooltip={
            selectedSheetId === 'all-sheets'
              ? "Please select a specific sheet first"
              : selectedRowId === null
                ? "Please select a student first"
                : ""
          }
          onClick={() => {
            handleButtonClick(
              <ModifyStudentComponent
                data={displayData}
                closeSidebar={closeSidebar}
                selectedRowId={selectedRowId}
                setRefresh={setRefresh}
                accessToken={accessToken}
              />
            );
            setSidebarTitle("Modify Student");
          }}
        >
          Modify
        </button>
        <button
          key="delete-sheet-button"
          className={styles.sheetButton}
          disabled={selectedSheetId === 'all-sheets' || selectedRowId === null}
          data-tooltip={
            selectedSheetId === 'all-sheets'
              ? "Please select a specific sheet first"
              : selectedRowId === null
                ? "Please select a student first"
                : ""
          }
          onClick={() => {
            if (window.confirm("Are you sure you want to delete this student?")) {
              fetch(
                `${window.env.REACT_APP_BACKEND_URL}/api/sheet/sheetRow/${selectedRowId}`,
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
                  alert("Student deleted successfully!");
                  setSelectedRowId(null);
                  closeSidebar();
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
  data: PropTypes.array.isRequired,
  selectedSheetId: PropTypes.string,
  setSelectedSheetId: PropTypes.func.isRequired,
  sheetButtonsRef: PropTypes.object.isRequired,
  handleButtonClick: PropTypes.func.isRequired,
  setSidebarTitle: PropTypes.func.isRequired,
  displayData: PropTypes.array.isRequired,
  closeSidebar: PropTypes.func.isRequired,
  selectedRowId: PropTypes.string,
  setDisplayData: PropTypes.func.isRequired,
  setSelectedRowId: PropTypes.func.isRequired,
  setRefresh: PropTypes.func.isRequired,
  accessToken: PropTypes.string.isRequired,
};

export default Home;

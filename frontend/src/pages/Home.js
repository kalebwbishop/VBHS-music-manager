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
  const [sidebarContentIndex, setSidebarContentIndex] = useState(0);
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
        console.log("Response:", response);
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
        console.log("Sheet data loaded successfully:", data);
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
          combinedData.rows.push(...sheet.rows);
        });

        setData([combinedData, ...data]);
        setDisplayData(combinedData);

        console.log("Display data:", combinedData);

        // Initialize sheet order if not exists
        const sheetOrder = getJSONCookie("sheetOrder") || [];
        if (sheetOrder.length === 0) {
          const initialOrder = data.map((sheet, index) => ({ id: sheet._id, position: index }));
          setJSONCookie("sheetOrder", initialOrder);
        }
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

    if (data) {
      if (selectedSheetId === null) {
        // setDisplayData(data);
      } else {
        const sheetIndex = data.findIndex(sheet => sheet._id === selectedSheetId);
        if (sheetIndex !== -1) {
          // setDisplayData(data[sheetIndex]);
        }
      }
    }
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
      className={`${styles.container} ${showSidebar ? styles.containerSidebarOpen : ""
        }`}
    >
      {accessToken ? (
        <div>
          <div ref={headerRef} className={styles.headerContainer}>
            <h2 className={styles.headerTitle}>VBHS Music Manager</h2>
            <div className={styles.buttonGroup}>
              <StudentSearch
                data={data}
                selectedSheetId={selectedSheetId}
                setDisplayData={setDisplayData}
                sidebarContentIndex={sidebarContentIndex}
                setSearchValue={setSearchValue}
                searchValue={searchValue}
              />
              <button
                onClick={() => {
                  handleButtonClick(
                    <EmailExportComponent
                      data={data}
                      setDisplayData={setDisplayData}
                    />
                  );
                  setSidebarTitle("Email/Export");
                  setSidebarContentIndex(1);
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
            </div>
          </div>
          <div
            className={`${styles.tableContainer} ${showSidebar ? styles.tableContainerSidebarOpen : ""}`}
            style={{
              maxHeight: `calc(95vh - ${headerRef?.current?.offsetHeight || 0
                }px - ${sheetButtonsRef?.current?.offsetHeight || 0}px)`,
              minHeight: `calc(95vh - ${headerRef?.current?.offsetHeight || 0
                }px - ${sheetButtonsRef?.current?.offsetHeight || 0}px)`,
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
              selectedSheetId={selectedSheetId}
              setSelectedSheetId={setSelectedSheetId}
              sheetButtonsRef={sheetButtonsRef}
              handleButtonClick={handleButtonClick}
              setSidebarTitle={setSidebarTitle}
              setSidebarContentIndex={setSidebarContentIndex}
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
  selectedSheetId,
  setSelectedSheetId,
  sheetButtonsRef,
  handleButtonClick,
  setSidebarTitle,
  setSidebarContentIndex,
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

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.target.style.opacity = '0.5';
  };

  const handleDragEnd = (e) => {
    setDraggedIndex(null);
    setDropTargetIndex(null);
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
    if (draggedIndex === null || draggedIndex === index) return;

    const sheetOrder = getJSONCookie("sheetOrder") || [];
    const reorderedSheets = [...sheetOrder];
    const [movedSheet] = reorderedSheets.splice(draggedIndex, 1);
    reorderedSheets.splice(index, 0, movedSheet);

    // Update positions
    const updatedOrder = reorderedSheets.map((sheet, idx) => ({
      ...sheet,
      position: idx
    }));

    setJSONCookie("sheetOrder", updatedOrder);
    setDropTargetIndex(null);
    setRefresh(prev => !prev);
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
                <div className={styles.dropIndicator} />
              )}
              <button
                draggable
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDragLeave={(e) => handleDragLeave(e, idx)}
                onDrop={(e) => handleDrop(e, idx)}
                className={`${styles.sheetButton} ${selectedSheetId === sheet._id ? styles.active : ""} ${draggedIndex === idx ? styles.dragging : ""}`}
                onClick={() => {
                  if (selectedSheetId === sheet._id) {
                    handleButtonClick(
                      <EditSheetComponent
                        closeSidebar={closeSidebar}
                        setRefresh={setRefresh}
                        accessToken={accessToken}
                        sheetName={sheet.name}
                        sheetId={sheet._id}
                        displayData={displayData}
                      />
                    );
                    setSidebarTitle("Edit Sheet");
                    setSidebarContentIndex(2);
                  }
                  setSelectedSheetId(sheet._id);
                }}
                data-tooltip={selectedSheetId === sheet._id ? "Click again to edit sheet" : "Drag to reorder"}
                style={{
                  cursor: 'grab',
                  position: 'relative'
                }}
              >
                {sheet.name}
                <span style={{
                  position: 'absolute',
                  right: '5px',
                  opacity: '0.5',
                  fontSize: '12px'
                }}>⋮⋮</span>
              </button>
            </React.Fragment>
          );
        })}

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
                setRefresh={setRefresh}
                accessToken={accessToken}
                setDisplayData={setDisplayData}
                setSelectedSheetId={setSelectedSheetId}
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

      <div className={styles.rightButtons}>
        <button
          key="add-sheet-button"
          className={styles.sheetButton}
          disabled={selectedSheetId === null}
          data-tooltip={selectedSheetId === null ? "Please select a specific sheet first" : ""}
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
            setSidebarContentIndex(4);
          }}
        >
          Add
        </button>
        <button
          key="modify-sheet-button"
          className={styles.sheetButton}
          disabled={selectedSheetId === null || selectedRowId === null}
          data-tooltip={
            selectedSheetId === null
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
            setSidebarContentIndex(5);
          }}
        >
          Modify
        </button>
        <button
          key="delete-sheet-button"
          className={styles.sheetButton}
          disabled={selectedSheetId === null || selectedRowId === null}
          data-tooltip={
            selectedSheetId === null
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
                  console.log("Student deleted successfully:", data);
                  alert("Student deleted successfully!");
                  closeSidebar();
                  setSelectedRowId(null);
                  setRefresh((prev) => !prev);
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
  setSidebarContentIndex: PropTypes.func.isRequired,
  displayData: PropTypes.array.isRequired,
  closeSidebar: PropTypes.func.isRequired,
  selectedRowId: PropTypes.string,
  setDisplayData: PropTypes.func.isRequired,
  setSelectedRowId: PropTypes.func.isRequired,
  setRefresh: PropTypes.func.isRequired,
  accessToken: PropTypes.string.isRequired,
};

export default Home;

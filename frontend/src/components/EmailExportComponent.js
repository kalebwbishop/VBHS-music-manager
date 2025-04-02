import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";

import FilterComponent from "./FilterComponent";
import EmailComponent from "./EmailComponent";
import ExportComponent from "./ExportComponent";
import SortComponent from "./SortComponent";

function EmailExportComponent({ allData, data, setDisplayData, sheetNames }) {
    const [currentStep, setCurrentStep] = useState(0);
    const [stepStack, setStepStack] = useState([0]);

    const [filteredData, setFilteredData] = useState(data);

    const showNext = [
        true,
        false,
        false,
        true,
        false,
    ]

    const handleNextClick = (nextStep) => {
        nextStep = nextStep || currentStep + 1;

        setCurrentStep(nextStep);
        setStepStack([...stepStack, nextStep]);
    }

    const handleBackClick = () => {
        setCurrentStep(stepStack[stepStack.length - 2]);
        setStepStack(stepStack.slice(0, stepStack.length - 1));
    }

    useEffect(() => {
        setDisplayData(filteredData);
    }, [filteredData]);

    const sidebarContentList = [
        <FilterComponent key="filter" allData={allData} setFilteredData={setFilteredData} sheetNames={sheetNames} />,
        <EmailorExportComponent key="emailOrExport" handleNextClick={handleNextClick}/>,
        <EmailComponent key="email" data={filteredData} />,
        <SortComponent key="sort" data={filteredData} setSortedData={setDisplayData} />,
        <ExportComponent key="export" data={filteredData} />,
    ];

    return (
        <>
            {sidebarContentList[currentStep]}

            <div style={{ height: "20px" }} />
            <br />

            {/* Back Button */}
            {currentStep > 0 && (
                <button
                    onClick={() => {
                        handleBackClick();
                    }}
                    style={{
                        padding: "10px",
                        backgroundColor: "#007bff",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                    }}
                >
                    Back
                </button>
            )}

            {/* Next button */}
            {currentStep < sidebarContentList.length - 1
            && showNext[currentStep]
            && (
            <button
                onClick={() => {
                    handleNextClick();
                }}
                style={{
                    padding: "10px",
                    backgroundColor: "#007bff",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                }}
            >
                Next
            </button>
            )}
        </>
    );
}

EmailExportComponent.propTypes = {
    allData: PropTypes.array.isRequired,
    data: PropTypes.array.isRequired,
    setDisplayData: PropTypes.func.isRequired,
    sheetNames: PropTypes.array.isRequired,
};

const EmailorExportComponent = ({handleNextClick}) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
                onClick={() => handleNextClick(2)}
                style={{
                    padding: "10px",
                    backgroundColor: "#f78429",
                    color: "black",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    width: "100%",
                    fontWeight: "bold"
                }}
            >
                Email
            </button>
            <button
                onClick={() => handleNextClick(3)}
                style={{
                    padding: "10px",
                    backgroundColor: "#f78429",
                    color: "black",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    width: "100%",
                    fontWeight: "bold"
                }}
            >
                Export
            </button>
        </div>
    );
};

EmailorExportComponent.propTypes = {
    handleNextClick: PropTypes.func.isRequired,
};

export default EmailExportComponent;

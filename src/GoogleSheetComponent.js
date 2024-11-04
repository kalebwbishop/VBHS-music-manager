import React, { useEffect, useState, useRef } from "react";
import { gapi } from "gapi-script";

import StudentSearch from "./StudentSearch";
import EmailComponent from "./EmailComponent";
import ExportComponent from "./ExportComponent";
import FilterComponent from "./FilterComponent";
import styles from "./GoogleSheetComponent.module.css";

const CLIENT_ID = process.env.REACT_APP_CLIENT_ID;
const API_KEY = process.env.REACT_APP_API_KEY;
const SCOPES = "https://www.googleapis.com/auth/spreadsheets.readonly";
const SHEET_ID = process.env.REACT_APP_SHEET_ID;
const RANGE = "Sheet1";

const GoogleSheetComponent = () => {
  const testData = JSON.parse(
    `[["Student First","Student Last ","Grade","Student Email","Student Cell","Parent 1 First"," Parent 1 Last ","Parent 1 email","Parent 1 cell","Parent 2 First","Parent 2 Last ","Parent 2 email","Parent 2 cell"],["Jackson","Daniel","7","30daniel@vbschools.net","","Jennifer","Daniel","samnjend@yahoo.com","419-721-3065","Samuel","Daniel","warriord732001@gmail.com","419-722-4878"],["Caleb","Fowler","8","29fowler@vbschools.net","419-461-7097","Meredith","Glazener","meredithglazener@gmail.com","419-265-0462","Christopher","Fowler","","910-620-6150"],["Liam","Hoerig","8","29hoerig@vbschools.net","567-294-1570","Ashley","Butler","butlergarden123@gmail.com","419-618-2777","David","Miller","","419-957-5877"],["Karson","Rinker","8","29rinker@vbschools.net","","Melody","Rinker","MRRINKER@MARATHONPETROLEUM.COM","419-619-2816","Justin","Rinker","","419-619-7701"],["Laiken","Belt","9","28belt@vbschools.net","330-204-3634","Dawn","Barnes","bar21daw@gmail.com","740-502-8626","Raymond","Belt","","740-294-5727"],["Rachel","Betts","9","28betts@vbschools.net","419-315-6567","Jerry","Betts","jsbetts@frontier.com","419-722-2863","Sarah","Betts","bettssa97@gmail.com","419-722-0168"],["Andrea","Groman","9","28groman@vbschools.net","567-271-8709","Allison","Groman","ALLISONGROMAN@HOTMAIL.COM","419-348-8612","Andy","Groman","","419-348-8625"],["Preston","Harnjo","9","28harnjo@vbschools.net","419-957-6230","Yoko","Harnjo","ychristinen@yahoo.com","419-957-5529","Hendrik","Harnjo","","931-774-9060"],["Alicia","Lebron","9","28lebron@vbschools.net","773-901-0882","Vanessa","Hall","vanessa-hall46@hotmail.com","847-942-1483","Paco","Lebron"],["Rachael","Miller","9","28miller@vbschools.net","419-889-1309","Ashley","Butler","Butlergarden123@gmail.com","419-618-2777","David","Miller","","419-957-5877"],["Isaiah","Moyer","9","28moyer@vbschools.net","","Sarah","Moyer","sarahemoyer@yahoo.com","419-306-5237","Nathan","Moyer","nmoyer@woh.rr.com","419-979-9943"],["Korbin","Preble","9","28preble@vbschools.net","419-701-1086","Hana","Blackburn","hanakalei@yahoo.com","419-701-1965","Dylan","Preble","","419-701-9797"],["Matthew","Puperi","9","28puperi@vbschools.net","419-889-9831","Jessica","Puperi","jpuperi@gmail.com","419-788-0356","Joe","Puperi","joe@advancedtreehealth.com","419-889-1123"],["Gourav","Rohidas","9","28rohidas@vbschools.net","567-624-1341","Nilamani","Rohidas","nrohidas@gmail.com","567-213-9493","Kumudini","Rohidas","kumudini.rohidas@gmail.com","479-268-8617"],["Ashleigh","Doyle","10","27doyle@vbschools.net","567-213-9557","Andria","Doyle","dr.andria.doyle@gmail.com","330-317-0129","Ryan","Doyle","Ryan@rwdoyle.net","937-307-2864"],["Dakota","Herricks","10","27herricks@vbschools.net","","Virginia","Mckeever","STOKESTER2@HOTMAIL.COM","419-674-6995","Brad","Stough","gin052665@yahoo.com"],["Carter","Jackson","10","27jackson@vbschools.net","567-250-4931","Tiffany","Jackson","trjackson4@outlook.com","419-306-1589","Brad","Jackson","btj12@hotmail.com","419-905-6217"],["Gillyanne","Vermillion","10","27vermillion@vbschools.net","","Aaron","Vermillion","Vermillion.aaron@yahoo.com","419-348-3219","Mandy","Vermillion","wolfmommy4@gmail.com","419-315-3083"],["David","Cavera","11","26cavera1@vbschools.net","419-345-1691","Angela","Cavera","acavera@vbschools.net","419-266-9970","Christopher","Cavera","ccavera@bgsu.edu","419-266-9966"],["Emily","Clark","11","26eclark@vbschools.net","419-314-1357","Jason","Clark","bgsuclarks@gmail.com","419-306-7327","Crystal","Clark","crystalkclark4@gmail.com","419-306-7326"],["Samuel","Deerwester","11","26deerwester@vbschools.net","","Kristen","Deerwester","deerwesterka@gmail.com","419-434-0453","Todd","Deerwester","","419-434-0423"],["John","Finley","11","26finley@vbschools.net","567-271-8588","Brenda","Finley","kaukonenb@hotmail.com","419-957-2094","J. Lance","Finley","jlfinley92@hotmail.com","419-348-3878"],["Alexander","French","11","26french@vbschools.net","419-348-9480","Jennifer","French","jennifer.french74@gmail.com","419-348-5093"],["Timothy","Grant","11","26grant@vbschools.net","","Mishka","Grant","destinykeigh1@gmail.com","419-819-7300","Stephen","Grant","","419-819-2132"],["Madison","Hedrick","11","26hedrick@vbschools.net","419-302-9475","Tanya","Craun","tanyacraun@rocketmail.com","419-302-9600","Ron","Hedrick","","419-672-8990"],["Trystin","Hutchins","11","26hutchins@vbschools.net","419-908-1509","Constance","Hutchins","champs100904@gmail.com","419-788-8911","Eric","Hutchins","Ehutch19@gmail.com","419-788-1248"],["Amelia","Leatherman","11","26leatherman@vbschools.net","419-957-1717","George","Leatherman","Gleatherman0@gmail.com","419-957-8387","Sheri","Leatherman","Sheri.leatherman72@gmail.com","419-957-8389"],["Geneva","Lewandowski","11","26lewandowski@vbschools.net","419-707-1605","Beth","Lewandowski","blewandowski@marathonpetroleum.com","419-889-1876","Art","Lewandowski","alewandowski75@gmail.com","419-889-7551"],["Andrew","Puperi","11","26puperi@vbschools.net","419-788-6332","Jessica","Puperi","jpuperi@gmail.com","419-788-0356","Joe","Puperi","joe@advancedtreehealth.com","419-889-1123"],["Brandon","Russell","11","26russell@vbschools.net","567-525-1618","Julie","Russell","julrdld@gmail.com","419-348-8988","Kevin","Russell","kdr1232@yahoo.com","419-306-9383"],["Luke","Stultz","11","26stultz@vbschools.net","419-819-2013","Jaime","Stultz","jaime.stultz@gmail.com","614-296-5368","Michael","Stultz","mike.stultz@gmail.com","614-506-0887"],["Josalyn","Swaisgood","11","26swaisgood@vbschools.net","567-429-8366","Marie","Swaisgood","swaz11@woh.rr.com","419-348-2118","Jeff","Swaisgood","","419-348-8075"],["Sadie","Thorla-Lopez","11","26thorlalopez@vbschools.net","567-218-9235","Carmen","Thorla-Lopez","carmenthorla@gmail.com","561-245-1826","Yuhann","Lopez","yuhannlopezmd@gmail.com","216-334-7621"],["Cullen","Tussing","11","26tussing@vbschools.net","567-271-1749","Jennifer","Barchent","jenniferbarchent@gmail.com","419-890-7416","Cody","Tussing","Jacksspleen@aol.com","419-306-2741"],["Camden","Voland","11","26voland@vbschools.net","419-619-6113","Veronica","Voland","veronicavoland@yahoo.com","419-957-6377"],["McKenzie","Rider","11","29rider@vbschools.net"],["Luke","Casselman","12","25Casselman@vbschools.net","419-957-1924","Kevin","Casselman","kevincasselman@hotmail.com","419-348-2009","Susan","Casselman","susancasselman@hotmail.com","419-429-9441"],["Aaron","Elliott","12","25elliott@vbschools.net","","Dawn","Elliott","cjdrelliott@woh.rr.com","419-306-4783","Chris","Elliott","cjdrelliott@gmail.com","419-306-4808"],["Alexander","Koehler","12","25koehler@vbschools.net","567-294-1102","Patty","Koehler","prk1212@ymail.com","419-306-6871","Andrew","Koehler","ark219@ymail.com","419-306-6870"],["Jameson","Krantz","12","25krantz@vbschools.net","","Amy","Krantz","akrantz76@yahoo.com","419-957-7493","Keith","Krantz","loc50welder@yahoo.com","419-266-4798"],["Emilio","Nunez","12","25nunez@vbschools.net","567-294-7336","Charity","Nunez","Charityenunez@gmail.com","419-307-5366","Fidencio","Nunez","fidencionunez@gmail.com","567-525-1835"],["Courtney","Snyder","12","25snyder@vbschools.net","567-208-9879","Teresa","Snyder","snydert2002@gmail.com","419-722-0797","Aaron","Snyder"],["Nigel","Woodall","12","25woodall@vbschools.net","567-213-9330","Clint","Woodall","clintthecoolguy@yahoo.com","419-722-0304","Yu","Li","lucy.woodall@hotmail.com","567-301-6219"]]`
  );

  const [data, setData] = useState(testData); // Change to null to test loading
  const [filteredData, setFilteredData] = useState(testData); // Change to null to test loading
  const [isSignedIn, setIsSignedIn] = useState(true); // Change to false to test sign in
  const [showSidebar, setShowSidebar] = useState(false);
  const [sidebarContent, setSidebarContent] = useState("");
  const [sidebarContentIndex, setSidebarContentIndex] = useState(0);

  const headerRef = useRef(null);

  // useEffect(() => {
  //   const initClient = () => {
  //     gapi.client
  //       .init({
  //         apiKey: API_KEY,
  //         clientId: CLIENT_ID,
  //         scope: SCOPES,
  //         discoveryDocs: [
  //           "https://sheets.googleapis.com/$discovery/rest?version=v4",
  //         ],
  //       })
  //       .then(() => {
  //         const authInstance = gapi.auth2.getAuthInstance();
  //         const isUserSignedIn = authInstance.isSignedIn.get();
  //         setIsSignedIn(isUserSignedIn);

  //         if (isUserSignedIn) {
  //           loadSheetData();
  //         } else {
  //           authInstance.signIn().then(() => {
  //             setIsSignedIn(true);
  //             loadSheetData();
  //           });
  //         }
  //       });
  //   };

  //   gapi.load("client:auth2", initClient);
  // }, []);

  useEffect(() => {
    if (isSignedIn && !data) {
      loadSheetData();
    }
  }, [isSignedIn]);

  const loadSheetData = () => {
    // gapi.client.sheets.spreadsheets.values
    //   .get({
    //     spreadsheetId: SHEET_ID,
    //     range: RANGE,
    //   })
    //   .then((response) => {
    //     setData(response.result.values);
    //     setFilteredData(response.result.values);
    //   })
    //   .catch((error) => {
    //     console.error("Error loading data from sheet:", error);
    //   });
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
      {isSignedIn && data ? (
        <div>
          <div ref={headerRef} className={styles.headerContainer}>
            <h2 className={styles.headerTitle}>VBHS Music Manager</h2>
            <div className={styles.buttonGroup}>
              <StudentSearch data={data} setFilteredData={setFilteredData} sidebarContentIndex={sidebarContentIndex} />
              {/* <input
                onChange={(event) => {
                  StudentSearch(data, setFilteredData, event.target.value);
                }}
                style={{ display: sidebarContentIndex == 1 ? "none" : "block" }}
                type="text"
                placeholder="Search For Student..."
              ></input> */}
              <button
                onClick={() => {
                  handleButtonClick(
                    <FilterComponent
                      data={data}
                      setFilteredData={setFilteredData}
                    />
                  );
                  setSidebarContentIndex(1);
                }}
              >
                Filter
              </button>
              <button
                onClick={() => {
                  handleButtonClick(<EmailComponent data={filteredData} />);
                  setSidebarContentIndex(2);
                }}
              >
                Email
              </button>
              <button
                onClick={() => {
                  handleButtonClick(<ExportComponent data={filteredData} />);
                  setSidebarContentIndex(3);
                }}
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
                  {filteredData[0]?.map((header, index) => (
                    <th key={`${header}-${index}`} className={styles.header}>
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredData.slice(1).map((row) => (
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

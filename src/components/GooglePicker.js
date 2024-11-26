import React, { useEffect, useState } from 'react';

const CLIENT_ID = process.env.REACT_APP_CLIENT_ID;
const API_KEY = process.env.REACT_APP_API_KEY; // Replace with your API Key
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

const GooglePicker = () => {
  const [pickerLoaded, setPickerLoaded] = useState(false);
  const [token, setToken] = useState(null);

  useEffect(() => {
    // Load the Picker library
    const loadPickerLibrary = () => {
      window.gapi.load('picker', () => setPickerLoaded(true));
    };

    // Initialize Google API client
    const initGoogleAPI = () => {
      window.gapi.load('client', async () => {
        await window.gapi.client.init({
          apiKey: API_KEY,
          discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
        });
        loadPickerLibrary();
      });
    };

    // Initialize the GIS library
    const initGIS = () => {
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: (response) => {
          setToken(response.access_token);
        },
      });

      document.getElementById('signin-button').addEventListener('click', () => {
        tokenClient.requestAccessToken();
      });
    };

    initGIS();
    initGoogleAPI();
  }, []);

  const createPicker = () => {
    if (pickerLoaded && token) {
      const picker = new window.google.picker.PickerBuilder()
        .addView(window.google.picker.ViewId.SPREADSHEETS) // Restrict to Google Sheets
        .setOAuthToken(token)
        .setDeveloperKey(API_KEY)
        .setCallback((data) => {
          if (data.action === window.google.picker.Action.PICKED) {
            const documentId = data.docs[0].id;
            console.log('Selected Spreadsheet ID:', documentId);
            alert(`Selected Spreadsheet ID: ${documentId}`);
          }
        })
        .build();
      picker.setVisible(true);
    }
  };

  return (
    <div>
      <button id="signin-button">Sign In with Google</button>
      <button onClick={createPicker} disabled={!token}>
        Select a Google Sheet
      </button>
    </div>
  );
};

export default GooglePicker;

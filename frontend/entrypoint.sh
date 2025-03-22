#!/bin/sh

npm install -g serve

# Enter REACT_APP_BACKEND_URL in config.js
sed -i "s|REACT_APP_BACKEND_URL_PLACEHOLDER|${REACT_APP_BACKEND_URL}|g" /app/build/config.js

# Set the desired port
PORT=${PORT:-8080}

# Run the application on the specified port
PORT=$PORT serve -s build
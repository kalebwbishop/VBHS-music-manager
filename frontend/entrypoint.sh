#!/bin/sh

# Enter REACT_APP_BACKEND_URL in config.js
sed -i "s|REACT_APP_BACKEND_URL_PLACEHOLDER|${REACT_APP_BACKEND_URL}|g" /usr/share/nginx/html/config.js

# Set the desired port
PORT=${PORT:-8080}

# Run the application on the specified port
PORT=$PORT npm run start
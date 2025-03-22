# Build stage
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Final stage
FROM node:18-alpine AS production

WORKDIR /app

# Copy only the build artifacts
COPY --from=build /app/build /app/build

# Copy the entrypoint script
COPY entrypoint.sh /entrypoint.sh

# Make the script executable
RUN chmod +x /entrypoint.sh

# Expose port 8080
EXPOSE 8080

# Set the custom entrypoint
ENTRYPOINT ["/entrypoint.sh"]

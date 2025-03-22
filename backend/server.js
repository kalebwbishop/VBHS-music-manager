const express = require("express");
const cors = require("cors");
const sheetRoutes = require("./routes/sheetRoutes");
const auth = require("./routes/auth.routes");
const { DB_Connect } = require("./database");

const app = express();
const PORT = process.env.PORT || 5000;

// CORS Configuration
const corsOptions = {
  origin: "*", // Allow all origins (for testing)
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: "Content-Type,Authorization",
};

app.use(cors(corsOptions));
app.use(express.json());

let db_is_connected = false;

// Database Connection
DB_Connect()
  .then(() => {
    console.log("MongoDB Connected");
    db_is_connected = true;
  })
  .catch((err) => {
    console.error("MongoDB Connection Error:", err);
    process.exit(1);
  });

// Routes
app.use("/api/sheet", sheetRoutes);
app.use("/api/auth", auth)

app.get("/", (req, res) => {
  res.json({ message: `Hello world, database is${db_is_connected ? "" : " not"} connected` });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

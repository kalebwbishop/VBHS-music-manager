const express = require("express");
const { getSheetsRows } = require("../controllers/sheetsController");
const { getSheet0Rows, addSheet0Row, updateSheet0Row, deleteSheet0Row } = require("../controllers/sheet0Controller");
const verifyToken = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/", verifyToken, getSheetsRows);
router.get("/0", verifyToken, getSheet0Rows);
router.post("/0", verifyToken, addSheet0Row);
router.patch("/0/:id", verifyToken, updateSheet0Row);
router.delete("/0/:id", verifyToken, deleteSheet0Row);

module.exports = router;

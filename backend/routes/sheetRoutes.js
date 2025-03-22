const express = require("express");
const { getSheetsRows } = require("../controllers/sheetsController");
const { getSheet0Rows, addSheet0Row, updateSheet0Row, deleteSheet0Row } = require("../controllers/sheet0Controller");

const router = express.Router();

router.get("/", getSheetsRows);
router.get("/0", getSheet0Rows);
router.post("/0", addSheet0Row);
router.patch("/0/:id", updateSheet0Row);
router.delete("/0/:id", deleteSheet0Row);

module.exports = router;

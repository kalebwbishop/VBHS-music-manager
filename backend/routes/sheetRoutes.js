const express = require("express");
const { getSheetsRows, addSheet, updateSheet, deleteSheet, addSheetRow, updateSheetRow, deleteSheetRow  } = require("../controllers/sheetsController");
const verifyToken = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/", verifyToken, getSheetsRows);
router.post("/", verifyToken, addSheet);
router.patch("/:sheetId", verifyToken, updateSheet);
router.delete("/:sheetId", verifyToken, deleteSheet);

router.post("/:sheetId", verifyToken, addSheetRow);
router.patch("/:sheetId/:rowId", verifyToken, updateSheetRow);
router.delete("/:sheetId/:rowId", verifyToken, deleteSheetRow);

module.exports = router;

const mongoose = require("mongoose");
const Sheet = require("../models/sheetModel");

const models = {}; // Cache for dynamic models

async function getDynamicModel(sheetName) {
    if (models[sheetName]) return models[sheetName];

    const sheetMetadata = await Sheet.findOne({ name: sheetName });
    if (!sheetMetadata) throw new Error("Sheet metadata not found");

    const schemaDefinition = {};
    sheetMetadata.columns.forEach(col => {
        schemaDefinition[col.name] = getMongooseType(col.type);
    });

    const dynamicSchema = new mongoose.Schema(schemaDefinition);
    const model = mongoose.model(sheetName, dynamicSchema);
    models[sheetName] = model;

    return model;
}

function getMongooseType(type) {
    const typeMap = {
        string: String,
        number: Number,
        boolean: Boolean,
        date: Date
    };
    return typeMap[type.toLowerCase()] || String;
}

module.exports = { getDynamicModel };

const crypto = require("crypto");
require("dotenv").config();

if (!process.env.ENCRYPTION_KEY) {
    console.error("ENCRYPTION_KEY is missing! Current ENV:", process.env);
    throw new Error("ENCRYPTION_KEY is not set in the environment variables.");
}

const secretKey = Buffer.from(process.env.ENCRYPTION_KEY, "hex"); // 32-byte key
const iv = Buffer.alloc(16, 0); // 16-byte IV (Initialization Vector)

// Encrypt a string
function encryptData(data) {
    if (!data) return null; // Don't encrypt empty fields
    data = data.toString(); // Convert to string if it's not
    const cipher = crypto.createCipheriv("aes-256-cbc", secretKey, iv);
    let encrypted = cipher.update(data, "utf8", "hex");
    encrypted += cipher.final("hex");
    return encrypted;
}

// Decrypt a string
function decryptData(encryptedData) {
    if (!encryptedData) return null; // Handle empty fields
    if (typeof encryptedData !== "string") return encryptedData; // Return as is if not a string
    const decipher = crypto.createDecipheriv("aes-256-cbc", secretKey, iv);
    let decrypted = decipher.update(encryptedData, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
}

// Encrypt an object (skip fields starting with an underscore)
function encryptObject(obj) {
    const encryptedObj = {};
    for (let key in obj) {
        if (key.startsWith("_")) {
            encryptedObj[key] = obj[key]; // Skip system fields like _id
        } else {
            encryptedObj[key] = encryptData(obj[key]); // Encrypt all other fields
        }
    }
    return encryptedObj;
}

// Decrypt an object (skip fields starting with an underscore)
function decryptObject(encryptedObj) {
    const decryptedObj = {};

    // Access the plain object if it’s a Mongoose document
    const plainObj = encryptedObj._doc || encryptedObj; // Access ._doc for Mongoose docs

    // Iterate over all properties of the plain object
    for (let key in plainObj) {
        if (plainObj.hasOwnProperty(key)) { // Ensure we're iterating only over own properties
            // Check if the key starts with an underscore (system fields like _id, __v)
            if (key.startsWith("_") || key === "createdAt" || key === "updatedAt") {
                decryptedObj[key] = plainObj[key]; // Skip system fields
            } else {
                decryptedObj[key] = decryptData(plainObj[key]); // Decrypt the field
            }
        }
    }
    
    return decryptedObj;
}


module.exports = { encryptObject, decryptObject };

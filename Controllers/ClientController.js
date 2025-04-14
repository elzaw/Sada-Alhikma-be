const { Client } = require("../Models/ClientModel.js");
const xlsx = require("xlsx");
const csv = require("csv-parser");
const fs = require("fs");
const multer = require("multer");
const { Invoice } = require("../Models/InvoiceModel.js");

// Multer configuration for file upload
const upload = multer({ dest: "uploads/" }).single("file");

// إنشاء عميل جديد
const createClient = async (req, res) => {
  try {
    const client = new Client(req.body);
    await client.save();
    res.status(201).json(client);
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        code: 11000,
        keyValue: error.keyValue,
        message: `${field} is already in use`,
      });
    }
  }
};
// عرض عميل
const getClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id).populate("bookings");
    if (!client) return res.status(404).json({ error: "Client not found" });
    res.json(client);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// عرض كل العملاء
const getAllClients = async (req, res) => {
  try {
    const clients = await Client.find().populate("bookings");
    res.json(clients);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// تعديل العميل
const updateClient = async (req, res) => {
  try {
    const updatedClient = await Client.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedClient)
      return res.status(404).json({ error: "Client not found" });
    res.json(updatedClient);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// حذف العميل
const deleteClient = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        error:
          "غير مصرح لك بحذف العملاء. يجب أن تكون مسؤولاً للقيام بهذه العملية.",
      });
    }

    const deletedClient = await Client.findByIdAndDelete(req.params.id);
    if (!deletedClient)
      return res.status(404).json({ error: "العميل غير موجود" });
    res.json({ message: "تم حذف العميل بنجاح" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Handle file upload and process Excel/CSV
const uploadClientsFromFile = async (req, res) => {
  if (!req.file) {
    return res
      .status(400)
      .json({ success: false, message: "No file uploaded." });
  }

  const filePath = req.file.path;

  try {
    let results = [];
    if (req.file.mimetype === "text/csv") {
      // Process CSV file
      results = await new Promise((resolve, reject) => {
        const data = [];
        fs.createReadStream(filePath)
          .pipe(csv())
          .on("data", (row) => {
            // Validate required fields
            if (
              !row.name ||
              !row.phone ||
              !row.nationality ||
              !row.identityNumber ||
              !row.boardingLocation
            ) {
              reject(new Error("Missing required fields in the CSV file."));
            }
            data.push(row);
          })
          .on("end", () => resolve(data))
          .on("error", (error) => reject(error));
      });
    } else if (
      req.file.mimetype ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      req.file.mimetype === "application/vnd.ms-excel"
    ) {
      // Process Excel file
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      results = xlsx.utils.sheet_to_json(worksheet);

      // Validate required fields
      for (const row of results) {
        if (
          !row.name ||
          !row.phone ||
          !row.nationality ||
          !row.identityNumber ||
          !row.boardingLocation
        ) {
          throw new Error("Missing required fields in the Excel file.");
        }
      }
    } else {
      throw new Error("Unsupported file type.");
    }

    // Insert validated data into MongoDB
    await Client.insertMany(results);
    fs.unlinkSync(filePath); // Delete the file after processing
    res.json({ success: true, message: "File processed successfully." });
  } catch (error) {
    console.error("Error processing file:", error);
    fs.unlinkSync(filePath); // Delete the file in case of error
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createClient,
  getClient,
  getAllClients,
  updateClient,
  deleteClient,
  uploadClientsFromFile,
  upload, // Export the multer upload middleware
};

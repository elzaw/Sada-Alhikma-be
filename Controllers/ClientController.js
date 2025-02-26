const { Client } = require("../Models/ClientModel.js");
const xlsx = require("xlsx");
const csv = require("csv-parser");
const fs = require("fs");
const multer = require("multer");

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
    res.status(400).json({ error: error.message });
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
    const deletedClient = await Client.findByIdAndDelete(req.params.id);
    if (!deletedClient)
      return res.status(404).json({ error: "Client not found" });
    res.json({ message: "Client deleted successfully" });
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
    if (req.file.mimetype === "text/csv") {
      // Process CSV file
      const results = [];
      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (data) => results.push(data))
        .on("end", async () => {
          await Client.insertMany(results);
          fs.unlinkSync(filePath); // Delete the file after processing
          res.json({
            success: true,
            message: "CSV file processed successfully.",
          });
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
      const data = xlsx.utils.sheet_to_json(worksheet);
      await Client.insertMany(data);
      fs.unlinkSync(filePath); // Delete the file after processing
      res.json({
        success: true,
        message: "Excel file processed successfully.",
      });
    } else {
      fs.unlinkSync(filePath); // Delete the file if it's not CSV or Excel
      res
        .status(400)
        .json({ success: false, message: "Unsupported file type." });
    }
  } catch (error) {
    console.error("Error processing file:", error);
    fs.unlinkSync(filePath); // Delete the file in case of error
    res
      .status(500)
      .json({ success: false, message: "Failed to process file." });
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

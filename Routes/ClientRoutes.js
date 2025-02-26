const express = require("express");
const {
  getClient,
  createClient,
  getAllClients,
  deleteClient,
  updateClient,
  upload,
  uploadClientsFromFile,
  // sendWhatsAppMessage,
  // sendBulkWhatsAppMessages,
} = require("../Controllers/ClientController");

const router = express.Router();

router.route("/").get(getAllClients).post(createClient);

router.route("/:id").delete(deleteClient).put(updateClient).get(getClient);

router.post("/upload", upload, uploadClientsFromFile);

// router.route("/send-whatsapp").post(sendWhatsAppMessage);

// router.route("/send-bulk-whatsapp").post(sendBulkWhatsAppMessages);

module.exports = router;

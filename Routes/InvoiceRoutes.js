const express = require("express");

const {
  createInvoice,
  getAllInvoices,
  deleteInvoice,
  getInvoice,
  updateInvoice,
  getInvoiceByClientAndTrip,
  getMadinahReturnsByDate,
} = require("../Controllers/InvoiceController");

const router = express.Router();

router.route("/").post(createInvoice).get(getAllInvoices);

router.route("/:id").delete(deleteInvoice).get(getInvoice).put(updateInvoice);
router.get("/client/:clientId/trip/:tripId", getInvoiceByClientAndTrip); // المسار الجديد
router.route("/madinah-returns/by-date").get(getMadinahReturnsByDate);

module.exports = router;

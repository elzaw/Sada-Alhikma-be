const express = require("express");

const {
  createInvoice,
  getAllInvoices,
  deleteInvoice,
  getInvoice,
  updateInvoice,
  getInvoiceByClientAndTrip,
} = require("../Controllers/InvoiceController");

const router = express.Router();

router.route("/").post(createInvoice).get(getAllInvoices);

router.route("/:id").delete(deleteInvoice).get(getInvoice).put(updateInvoice);
router.get("/client/:clientId/trip/:tripId", getInvoiceByClientAndTrip); // المسار الجديد

module.exports = router;

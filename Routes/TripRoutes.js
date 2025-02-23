const express = require("express");
const {
  CreateTrip,
  UpdateTrip,
  DeleteTrip,
  GetTripReport,
  GetAllTrips,
  getTrip,
  GetLastTripNumberForDay,
  AddClientToTrip,
} = require("../Controllers/TripController");
const {
  getInvoiceByClientAndTrip,
} = require("../Controllers/InvoiceController");

const router = express.Router();

router.route("/").post(CreateTrip).put(UpdateTrip).get(GetAllTrips);

router.route("/last-trip-number").get(GetLastTripNumberForDay);
router.route("/report/:id").get(GetTripReport);

router.route("/:tripId/clients").post(AddClientToTrip);
router.route("/:id").delete(DeleteTrip).get(getTrip);
router.get("/client/:clientId/trip/:tripId", getInvoiceByClientAndTrip); // المسار الجديد

module.exports = router;

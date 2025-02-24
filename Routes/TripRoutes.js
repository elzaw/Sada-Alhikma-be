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
  getTripByClient,
} = require("../Controllers/TripController");

const router = express.Router();

router.route("/").post(CreateTrip).put(UpdateTrip).get(GetAllTrips);

router.route("/last-trip-number").get(GetLastTripNumberForDay);
router.route("/report/:id").get(GetTripReport);

router.route("/:tripId/clients").post(AddClientToTrip);
router.route("/:id").delete(DeleteTrip).get(getTrip);
router.get("/trip/:tripId/client/:clientId", getTripByClient); // المسار الجديد

module.exports = router;

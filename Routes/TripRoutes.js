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
  getTripsByDate,
  getFilteredTrips,
} = require("../Controllers/TripController");

const router = express.Router();

router.route("/").post(CreateTrip).put(UpdateTrip).get(GetAllTrips);
router.route("/bydate").get(getTripsByDate);
router.route("/last-trip-number").get(GetLastTripNumberForDay);
router.route("/report/:id").get(GetTripReport);

router.route("/:tripId/clients").post(AddClientToTrip);
router.route("/:id").delete(DeleteTrip).get(getTrip);
router.get("/trip/:tripId/client/:clientId", getTripByClient); // المسار الجديد

router.get("/filter", getFilteredTrips);

module.exports = router;

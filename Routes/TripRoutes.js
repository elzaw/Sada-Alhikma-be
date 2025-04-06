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
  DeleteClientFromTrip,
  UpdateClientOnTrip,
} = require("../Controllers/TripController");

const router = express.Router();

// Trip routes
router.route("/").post(CreateTrip).get(GetAllTrips);

router.route("/:id").get(getTrip).patch(UpdateTrip).delete(DeleteTrip);

// Trip report and filtering
router.route("/report/:id").get(GetTripReport);
router.route("/bydate").get(getTripsByDate);
router.route("/last-trip-number").get(GetLastTripNumberForDay);
router.get("/trips/filter", getFilteredTrips);

// Client-trip relationships
router.route("/:tripId/clients").post(AddClientToTrip);

router
  .route("/:tripId/clients/:clientId")
  .delete(DeleteClientFromTrip)
  .patch(UpdateClientOnTrip);

// Get trip with specific client
router.route("/trip/:tripId/client/:clientId").get(getTripByClient);

module.exports = router;

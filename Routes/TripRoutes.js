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
const { adminMiddleware } = require("../Middlewares/authMiddleware");

const router = express.Router();

// Specific routes first
router.route("/bydate").get(getTripsByDate);
router.route("/last-trip-number").get(GetLastTripNumberForDay);
router.route("/trips/filter").get(getFilteredTrips);
router.route("/report/:id").get(GetTripReport);

// General routes
router.route("/").post(CreateTrip).get(GetAllTrips);

// Parameterized routes
router
  .route("/:id")
  .get(getTrip)
  .patch(UpdateTrip)
  .delete(adminMiddleware, DeleteTrip);

// Client-trip relationships
router.route("/:tripId/clients").post(AddClientToTrip);
router
  .route("/:tripId/clients/:clientId")
  .delete(adminMiddleware, DeleteClientFromTrip)
  .patch(UpdateClientOnTrip);

// Get trip with specific client
router.route("/trip/:tripId/client/:clientId").get(getTripByClient);

module.exports = router;

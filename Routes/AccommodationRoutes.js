const express = require("express");
const {
  createAccommodation,
  getAccommodationByTripId,
} = require("../Controllers/AccommodationController");

const router = express.Router();

router.route("/").post(createAccommodation);

router.get("/:tripId", getAccommodationByTripId);

module.exports = router;

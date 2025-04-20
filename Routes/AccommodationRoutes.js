const express = require("express");
const {
  createAccommodation,
  getAccommodationByTripId,
  updateClientInGroup,
  deleteClientFromGroup,
  deleteGroup,
} = require("../Controllers/AccommodationController");

const router = express.Router();

router.route("/").post(createAccommodation);

router.get("/:tripId", getAccommodationByTripId);

// Update client in a specific room of a group
router.put(
  "/:tripId/groups/:groupName/rooms/:roomIndex/clients/:clientId",
  updateClientInGroup
);

// Delete client from a specific room of a group
router.delete(
  "/:tripId/groups/:groupName/rooms/:roomIndex",
  deleteClientFromGroup
);

// Delete an entire group
router.delete("/:tripId/groups/:groupName", deleteGroup);

module.exports = router;

const mongoose = require("mongoose");

const accommodationSchema = new mongoose.Schema(
  {
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
      required: true,
    },
    supervisorName: {
      type: String,
      required: true,
    },
    supervisorPhone: {
      type: String,
      required: true,
    },
    groups: [
      {
        name: String,
        rooms: [
          {
            clientId: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Client",
            },
            name: String,
            identity: String,
          },
        ],
      },
    ],
    roomCounts: {
      total: Number,
      six: Number,
      five: Number,
      four: Number,
      three: Number,
      two: Number,
    },
  },
  { collection: "Accommodation", timestamps: true }
);

const Accommodation = mongoose.model("Accommodation", accommodationSchema);

module.exports = { Accommodation };

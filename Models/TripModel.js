const mongoose = require("mongoose");

const accompanyingPersonSchema = new mongoose.Schema({
  name: { type: String, trim: true },
  nationality: { type: String, trim: true },
  identityNumber: { type: String, trim: true },
});

const tripSchema = new mongoose.Schema(
  {
    tripNumber: { type: String, required: true, unique: true, trim: true },
    date: { type: Date, required: true },
    leasingCompany: { type: String, required: true, trim: true },
    rentingCompany: { type: String, required: true, trim: true },

    busDetails: {
      busNumber: { type: String, required: true, trim: true },
      licensePlate: { type: String, required: true, trim: true },
      seatCount: { type: Number, required: true, min: 1 },
      departureLocation: { type: String, required: true, trim: true },
      destination: { type: String, required: true, trim: true },
    },

    drivers: [
      {
        driverName: { type: String, required: true, trim: true },
        driverId: { type: String, required: true, trim: true },
        driverPhone: { type: String, required: true, trim: true },
      },
    ],

    clients: [
      {
        client: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Client",
          required: true,
        },
        clientCount: { type: Number, default: 1, min: 1 },
        boardingLocation: { type: String, trim: true },
        accompanyingPersons: [accompanyingPersonSchema],
        returnStatus: { type: String, enum: ["نعم", "لا"], default: "لا" },
        returnDate: {
          type: Date,
          required: function () {
            return this.returnStatus === "نعم"; // Required only if returnStatus is "نعم"
          },
        },
        totalCost: { type: Number, default: 0, min: 0 },
        totalPaid: { type: Number, default: 0, min: 0 },
        remainingAmount: { type: Number, default: 0, min: 0 },
        notes: { type: String, trim: true },
      },
    ],

    totalTripCost: { type: Number, default: 0, min: 0 },
    totalTripPaid: { type: Number, default: 0, min: 0 },
    totalTripNetAmount: { type: Number, default: 0 },
  },
  { collection: "Trip", timestamps: true }
);

// Add pre-save middleware to set default boarding location
tripSchema.pre("save", async function (next) {
  try {
    // Set default boarding location from client data if not provided
    if (this.clients && this.clients.length > 0) {
      for (const client of this.clients) {
        if (!client.boardingLocation) {
          const clientDoc = await mongoose
            .model("Client")
            .findById(client.client);
          if (clientDoc) {
            client.boardingLocation = clientDoc.boardingLocation;
          }
        }
      }
    }

    // Recalculate totalTripCost only if clients array is provided and not empty
    if (this.clients && this.clients.length > 0) {
      this.totalTripCost = this.clients.reduce(
        (sum, client) => sum + client.totalCost,
        0
      );
    }

    // Ensure totalTripPaid does not exceed totalTripCost
    if (this.totalTripPaid > this.totalTripCost) {
      throw new Error("totalTripPaid cannot exceed totalTripCost.");
    }

    // Calculate totalTripNetAmount
    this.totalTripNetAmount = this.totalTripCost - this.totalTripPaid;

    next();
  } catch (error) {
    next(error);
  }
});

// Indexes for performance
tripSchema.index({ tripNumber: 1 });
tripSchema.index({ date: 1 });
tripSchema.index({ "busDetails.destination": 1 });

const Trip = mongoose.model("Trip", tripSchema);

module.exports = { Trip };

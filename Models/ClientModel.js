const { Schema, model } = require("mongoose");

const clientSchema = new Schema(
  {
    name: { type: String, required: true }, // اسم العميل
    phone: { type: String, required: true, unique: true }, // رقم الجوال
    nationality: { type: String, required: true }, // الجنسية
    identityNumber: { type: String, required: true, unique: true }, // رقم الهوية
    boardingLocation: { type: String, required: true }, // مكان الركوب
    bookings: [{ type: Schema.Types.ObjectId, ref: "Trip" }], // الحجوزات السابقة
  },
  { collection: "Client", timestamps: true }
);

const Client = model("Client", clientSchema);

module.exports = { Client };

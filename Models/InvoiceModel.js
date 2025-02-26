const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    }, // العميل
    trip: { type: mongoose.Schema.Types.ObjectId, ref: "Trip", required: true }, // الرحلة
    numberOfPeople: { type: Number, required: true }, // عدد الأفراد
    costPerPerson: { type: Number, required: true }, // تكلفة الفرد
    totalAmount: { type: Number, required: true }, // الإجمالي
    paidAmount: { type: Number, default: 0 }, // المدفوع
    bankTransfer: { type: Number, default: 0 }, // التحويل البنكي
    remainingAmount: { type: Number, default: 0 }, // المتبقي
    paymentMethod: {
      type: String,
      enum: ["cash", "bankTransfer"],
      required: true,
    }, // طريقة الدفع
    tripOption: {
      type: String,
      enum: [
        "oneWay",
        "roundTrip",
        "makkah",
        "makkahMadinah",
        "returnOnly",
        "accommodationOnly",
      ],
      required: true,
    }, // خيارات الرحلة
    madinahDepartureDate: { type: Date }, // تاريخ الذهاب إلى المدينة
    madinahReturnDate: { type: Date }, // تاريخ العودة من المدينة
    pickupLocation: { type: String, required: true }, // مكان الركوب
    numberOfDays: { type: Number, required: true }, // عدد الأيام
    reservationOfficer: { type: String, required: true }, // اسم مسجل الحجز
    notes: { type: String }, // ملاحظات
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User model
      // required: true,
    }, // المستخدم الذي أضاف البيانات
  },
  { collection: "Invoice", timestamps: true }
);

const Invoice = mongoose.model("Invoice", invoiceSchema);

module.exports = { Invoice };

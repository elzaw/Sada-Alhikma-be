const { Invoice } = require("../Models/InvoiceModel");

// إنشاء فاتورة جديدة
const createInvoice = async (req, res, next) => {
  try {
    const { client, trip } = req.body;

    // Check if an invoice already exists for this client and trip
    const existingInvoice = await Invoice.findOne({ client, trip });

    if (existingInvoice) {
      return res.status(400).json({
        error: "تم إنشاء فاتورة بالفعل لهذا العميل في هذه الرحلة.",
      });
    }

    // If no invoice exists, create a new one
    const invoice = new Invoice(req.body);
    await invoice.save();
    res.status(201).json(invoice);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// تعديل فاتورة
const updateInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!invoice)
      return res.status(404).json({ message: "Invoice not found." });

    res.json(invoice);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// عرض فاتورة
const getInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate({
      path: "client",
      select: "name phone nationality identityNumber boardingLocation",
    });

    if (!invoice)
      return res.status(404).json({ message: "Invoice not found." });

    res.json(invoice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// حذف فاتورة
const deleteInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);

    if (!invoice)
      return res.status(404).json({ message: "Invoice not found." });

    res.json({ message: "Invoice deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// عرض كل الفواتير
const getAllInvoices = async (req, res, next) => {
  try {
    const invoices = await Invoice.find();
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// عرض الفاتورة باستخدام clientId و tripId
const getInvoiceByClientAndTrip = async (req, res) => {
  try {
    const { clientId, tripId } = req.params;

    const invoice = await Invoice.findOne({
      client: clientId,
      trip: tripId,
    }).populate({
      path: "client",
      select: "name phone nationality identityNumber boardingLocation",
    });

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found." });
    }

    res.json(invoice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// controllers/invoiceController.js
const getMadinahReturnsByDate = async (req, res) => {
  try {
    const { madinahReturnDate } = req.query;

    if (!madinahReturnDate) {
      return res.status(400).json({ error: "تاريخ العودة مطلوب" });
    }

    const targetDate = new Date(madinahReturnDate);
    if (isNaN(targetDate.getTime())) {
      return res.status(400).json({ error: "تاريخ غير صالح" });
    }

    targetDate.setUTCHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const invoices = await Invoice.find({
      madinahReturnDate: { $gte: targetDate, $lt: nextDay },
    })
      .populate(
        "client",
        "name phone nationality identityNumber boardingLocation"
      )
      .populate("trip", "tripNumber date busDetails")
      .populate("reservationOfficer", "name");

    if (!invoices.length) {
      return res.status(404).json({ message: "لا توجد نتائج لهذا التاريخ" });
    }

    const formattedInvoices = invoices.map((invoice) => ({
      invoiceId: invoice._id,
      tripNumber: invoice.trip?.tripNumber || "غير متوفر",
      clientName: invoice.client?.name || "غير متوفر",
      phone: invoice.client?.phone || "غير متوفر",
      nationality: invoice.client?.nationality || "غير متوفر",
      identityNumber: invoice.client?.identityNumber || "غير متوفر",
      boardingLocation:
        invoice.client?.boardingLocation ||
        invoice.pickupLocation ||
        "غير متوفر",
      departureLocation:
        invoice.trip?.busDetails?.departureLocation || "غير متوفر",
      destination: invoice.trip?.busDetails?.destination || "غير متوفر",
      returnDate: invoice.madinahReturnDate,
      numberOfPassengers: invoice.numberOfPeople || 0,
      costPerPerson: invoice.costPerPerson || 0,
      totalAmount: invoice.totalAmount || 0,
      paidAmount: invoice.paidAmount || 0,
      remainingAmount: invoice.remainingAmount || 0,
      paymentMethod: invoice.paymentMethod || "غير محدد",
      tripOption: invoice.tripOption || "غير محدد",
      numberOfDays: invoice.numberOfDays || 0,
      reservationOfficer: invoice.reservationOfficer?.name || "غير محدد",
      notes: invoice.notes || "لا توجد ملاحظات",
      bankTransfer: invoice.bankTransfer || 0,
    }));

    res.json({
      success: true,
      count: invoices.length,
      data: formattedInvoices,
    });
  } catch (error) {
    console.error("Error fetching Madinah returns:", error);
    res.status(500).json({
      success: false,
      error: "حدث خطأ أثناء جلب بيانات العوادات",
    });
  }
};

// Helper function to format invoice data
const formatInvoice = (invoice) => ({
  tripNumber: invoice.trip?.tripNumber || "غير متوفر",
  clientName: invoice.client?.name || "غير متوفر",
  phone: invoice.client?.phone || "غير متوفر",
  nationality: invoice.client?.nationality || "غير متوفر",
  departureLocation: invoice.pickupLocation || "غير متوفر",
  returnDate: invoice.madinahReturnDate,
  tripOption: invoice.tripOption || "غير متوفر",
  accompanyingPersons: invoice.numberOfPeople || "غير متوفر",
});
module.exports = {
  createInvoice,
  updateInvoice,
  getInvoice,
  deleteInvoice,
  getAllInvoices,
  getInvoiceByClientAndTrip,
  getMadinahReturnsByDate,
};

const { Invoice } = require("../Models/InvoiceModel");

// إنشاء فاتورة جديدة
const createInvoice = async (req, res, next) => {
  try {
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
    const invoice = await Invoice.findById(req.params.id);

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

    const invoice = await Invoice.findOne({ client: clientId, trip: tripId });

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found." });
    }

    res.json(invoice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
module.exports = {
  createInvoice,
  updateInvoice,
  getInvoice,
  deleteInvoice,
  getAllInvoices,
  getInvoiceByClientAndTrip,
};

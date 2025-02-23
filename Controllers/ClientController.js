const { Client } = require("../Models/ClientModel.js");

// ��نشا�� عميل ��ديد
const createClient = async (req, res) => {
  try {
    const client = new Client(req.body);
    await client.save();
    res.status(201).json(client);
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        code: 11000,
        keyValue: error.keyValue,
        message: `${field} is already in use`,
      });
    }
    res.status(400).json({ error: error.message });
  }
};

// ��عرض عميل��
const getClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id).populate("bookings");
    if (!client) return res.status(404).json({ error: "Client not found" });
    res.json(client);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// عرض كل العملاء

const getAllClients = async (req, res) => {
  try {
    const clients = await Client.find().populate("bookings");
    res.json(clients);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
// ��تعديل العميل

const updateClient = async (req, res) => {
  try {
    const updatedClient = await Client.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedClient)
      return res.status(404).json({ error: "Client not found" });
    res.json(updatedClient);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// حذف العميل

const deleteClient = async (req, res) => {
  try {
    const deletedClient = await Client.findByIdAndDelete(req.params.id);
    if (!deletedClient)
      return res.status(404).json({ error: "Client not found" });
    res.json({ message: "Client deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ارسال رسالة واتساب لعميل

const sendWhatsAppMessage = async (req, res) => {
  try {
    const { phone, message } = req.body;
    if (!phone || !message)
      return res.status(400).json({ error: "Phone and message are required" });

    await client.messages.create({
      body: message,
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${phone}`,
    });

    res.json({
      success: true,
      message: "WhatsApp message sent successfully",
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ارسال رسائل لمجموعة من العملاء
const sendBulkWhatsAppMessages = async (req, res) => {
  try {
    const { phones, message } = req.body;
    if (!phones || !Array.isArray(phones) || phones.length === 0 || !message) {
      return res
        .status(400)
        .json({ error: "Phones array and message are required" });
    }

    const messages = phones.map((phone) =>
      client.messages.create({
        body: message,
        from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
        to: `whatsapp:${phone}`,
      })
    );

    await Promise.all(messages);
    res.json({
      success: true,
      message: "Bulk WhatsApp messages sent successfully",
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  createClient,
  getClient,
  getAllClients,
  updateClient,
  deleteClient,
  sendWhatsAppMessage,
  sendBulkWhatsAppMessages,
};

const mongoose = require("mongoose");
const { Client } = require("../Models/ClientModel");
const { Trip } = require("../Models/TripModel");

// إنشاء رحلة جديدة
const CreateTrip = async (req, res, next) => {
  try {
    const trip = new Trip(req.body);
    await trip.save();

    res.status(201).json(trip);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// تعديل رحلة
const UpdateTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!trip) return res.status(404).json({ error: "Trip not found" });
    res.json(trip);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// حذف رحلة
const DeleteTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findByIdAndDelete(req.params.id);
    if (!trip) return res.status(404).json({ error: "الرحلة غير موجودة" });
    res.json({ message: "تم حذف الرحلة بنجاح" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// تقرير الرحلة
const GetTripReport = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id).populate("clients");
    if (!trip) return res.status(404).json({ error: "Trip not found" });

    const report = {
      tripNumber: trip.tripNumber,
      date: trip.date,
      departureLocation: trip.departureLocation,
      destination: trip.destination,
      busDetails: trip.busDetails,
      clients: trip.clients,
      totalCost: trip.totalCost,
      totalPaid: trip.totalPaid,
      netAmount: trip.totalCost - trip.totalPaid,
    };

    res.json(report);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// كل الرحلات
const GetAllTrips = async (req, res, next) => {
  try {
    const trips = await Trip.find().populate("clients");
    res.json(trips);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

//
const getTrip = async (req, res) => {
  try {
    console.log("Fetching trip with ID:", req.params.id); // Debug: Check the tripId
    const trip = await Trip.findById(req.params.id).populate({
      path: "clients.client",
      model: "Client",
    });
    if (!trip) {
      console.log("Trip not found for ID:", req.params.id); // Debug
      return res.status(404).json({ error: "Trip not found" });
    }
    console.log("Trip found:", trip); // Debug: Check the fetched trip
    res.json(trip);
  } catch (error) {
    console.error("Error fetching trip:", error); // Debug
    res.status(400).json({ error: error.message });
  }
};

const GetLastTripNumberForDay = async (req, res) => {
  try {
    // Use the current date if no date is provided in the query
    const date = req.query.date || new Date().toISOString().split("T")[0];

    // Convert the date to YYMMDD format
    const formattedDate = new Date(date);
    const year = formattedDate.getFullYear().toString().slice(-2); // Last 2 digits of the year
    const month = String(formattedDate.getMonth() + 1).padStart(2, "0"); // Month (01-12)
    const day = String(formattedDate.getDate()).padStart(2, "0"); // Day (01-31)
    const datePrefix = `${year}${month}${day}`; // YYMMDD

    // Find all trips for the day
    const trips = await Trip.find({
      tripNumber: { $regex: `^${datePrefix}` },
    });

    if (trips.length === 0) {
      return res.json({ lastTripNumber: null }); // No trips for the day
    }

    // Extract the sequential numbers (last 2 digits) and find the maximum
    const sequentialNumbers = trips.map((trip) =>
      parseInt(trip.tripNumber.slice(-2), 10)
    );
    const maxSequentialNumber = Math.max(...sequentialNumbers);

    // Construct the last trip number
    const lastTripNumber = `${datePrefix}${String(maxSequentialNumber).padStart(
      2,
      "0"
    )}`;

    res.json({ lastTripNumber });
  } catch (error) {
    console.error("Error fetching last trip number:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Add a client to a trip
const AddClientToTrip = async (req, res) => {
  try {
    const { tripId } = req.params;
    const {
      clientId,
      accompanyingPersons,
      returnStatus,
      returnDate,
      totalCost,
      totalPaid,
      notes,
      boardingLocation,
    } = req.body;

    console.log("Received request body:", req.body);

    // التحقق من صحة clientId
    if (!mongoose.Types.ObjectId.isValid(clientId)) {
      console.log("Invalid Client ID format:", clientId);
      return res.status(400).json({ error: "Invalid Client ID format" });
    }

    // البحث عن العميل
    const client = await Client.findById(clientId);
    if (!client) {
      console.log(`Client not found: ${clientId}`);
      return res
        .status(404)
        .json({ error: `Client with ID ${clientId} not found` });
    }

    // البحث عن الرحلة
    const trip = await Trip.findById(tripId);
    if (!trip) {
      console.log(`Trip not found: ${tripId}`);
      return res
        .status(404)
        .json({ error: `Trip with ID ${tripId} not found` });
    }

    // التحقق من عدم إضافة العميل مسبقًا
    const isClientAlreadyAdded = trip.clients.some(
      (c) => c.client.toString() === clientId
    );
    if (isClientAlreadyAdded) {
      console.log(`Client already added to trip: ${clientId}`);
      return res
        .status(400)
        .json({ error: "العميل موجود بالفعل علي هذه الرحلة." });
    }

    // التحقق من الحقول المطلوبة
    if (
      totalCost === undefined ||
      totalPaid === undefined ||
      returnStatus === undefined
    ) {
      console.log("Missing fields:", { totalCost, totalPaid, returnStatus });
      return res.status(400).json({
        error: "Missing required fields: totalCost, totalPaid, or returnStatus",
      });
    }

    // التحقق من returnDate إذا كان returnStatus هو "نعم"
    if (returnStatus === "نعم" && !returnDate) {
      console.log("returnDate is required when returnStatus is 'نعم'");
      return res.status(400).json({
        error: "returnDate is required when returnStatus is 'نعم'",
      });
    }

    // حساب المبلغ المتبقي
    const remainingAmount = totalCost - totalPaid;

    // إضافة العميل إلى الرحلة
    const newClient = {
      client: clientId,
      accompanyingPersons: accompanyingPersons || [],
      returnStatus,
      returnDate: returnStatus === "نعم" ? returnDate : undefined,
      totalCost,
      totalPaid,
      remainingAmount,
      notes,
      boardingLocation: boardingLocation || client.boardingLocation, // Use provided location or client's default
    };

    trip.clients.push(newClient);

    // تحديث الحقول الإجمالية للرحلة
    trip.totalTripCost += totalCost;
    trip.totalTripPaid += totalPaid;
    trip.totalTripNetAmount = trip.totalTripCost - trip.totalTripPaid;

    await trip.save();

    // إضافة الرحلة إلى قائمة حجوزات العميل
    client.bookings.push(tripId);
    await client.save();

    console.log("Client added successfully:", clientId);
    res
      .status(201)
      .json({ message: "Client added to trip successfully", trip });
  } catch (error) {
    console.error("Error adding client to trip:", error);
    res.status(500).json({ error: error.message });
  }
};

const getTripByClient = async (req, res) => {
  try {
    const { tripId, clientId } = req.params;
    console.log(`Fetching trip: ${tripId} for client: ${clientId}`);

    // Fetch the trip and populate the `clients.client` field
    const trip = await Trip.findById(tripId).populate("clients.client");

    if (!trip) {
      console.log("Trip not found:", tripId);
      return res.status(404).json({ error: "Trip not found" });
    }

    // Find the specific client within the trip's clients array
    const clientData = trip.clients.find(
      (c) => c.client._id.toString() === clientId
    );

    if (!clientData) {
      console.log("Client not found in this trip:", clientId);
      return res.status(404).json({ error: "Client not found in this trip" });
    }

    // Return full trip details but only with the matched client in `clients`
    res.json({
      ...trip.toObject(), // Convert Mongoose document to a plain object
      clients: [clientData], // Replace the clients array with only the matched client
    });
  } catch (error) {
    console.error("Error fetching trip for client:", error);
    res.status(500).json({ error: error.message });
  }
};

const getTripsByDate = async (req, res) => {
  const { returnDate } = req.query;

  if (!returnDate) {
    return res.status(400).json({ message: "Return date is required." });
  }

  try {
    // Convert returnDate to a Date object at UTC midnight
    const targetDate = new Date(returnDate);
    targetDate.setUTCHours(0, 0, 0, 0);

    // Define the range to match the exact date ignoring time
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    // Fetch trips that contain at least one client with the return date
    const trips = await Trip.find({
      "clients.returnDate": { $gte: targetDate, $lt: nextDay },
    }).populate("clients.client");

    if (!trips.length) {
      return res
        .status(404)
        .json({ message: "No trips found for the given return date." });
    }

    // **Filter clients within each trip before sending response**
    const filteredTrips = trips.map((trip) => {
      const filteredClients = trip.clients.filter(
        (c) =>
          c.returnDate && c.returnDate >= targetDate && c.returnDate < nextDay
      );

      return {
        ...trip.toObject(), // Convert Mongoose document to plain object
        clients: filteredClients, // Replace with filtered clients
      };
    });

    res.json(filteredTrips);
  } catch (error) {
    console.error("Error fetching trips:", error);
    res.status(500).json({ message: "Server error while fetching trips." });
  }
};

const getFilteredTrips = async (req, res) => {
  const { tripType, date } = req.query;

  try {
    // بناء الاستعلام
    let query = {};

    // تحديد نوع الرحلة بناءً على القيم الإنجليزية
    if (tripType) {
      if (tripType === "go") {
        query["busDetails.departureLocation"] = "المدينة"; // رحلات الذهاب من المدينة
      } else if (tripType === "return") {
        query["busDetails.destination"] = "المدينة"; // رحلات العودة إلى المدينة
      } else {
        return res
          .status(400)
          .json({ error: "نوع الرحلة غير صالح. استخدم 'go' أو 'return'." });
      }
    } else {
      // إذا لم يتم تحديد نوع الرحلة، نعرض جميع رحلات المدينة (ذهاب وعودة)
      query.$or = [
        { "busDetails.departureLocation": "المدينة" }, // رحلات الذهاب
        { "busDetails.destination": "المدينة" }, // رحلات العودة
      ];
    }

    // فلتر التاريخ
    if (date) {
      const targetDate = new Date(date);
      targetDate.setUTCHours(0, 0, 0, 0); // ضبط الوقت إلى منتصف الليل

      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);

      // البحث حسب تاريخ الرحلة أو تاريخ عودة العملاء
      query.$and = [
        {
          $or: [
            { date: { $gte: targetDate, $lt: nextDay } }, // تاريخ الرحلة
            { "clients.returnDate": { $gte: targetDate, $lt: nextDay } }, // تاريخ عودة العملاء
          ],
        },
      ];
    }

    // جلب الرحلات المصفاة
    const trips = await Trip.find(query).populate("clients.client");

    // إرجاع النتائج (حتى لو كانت فارغة)
    res.json(trips || []);
  } catch (error) {
    console.error("خطأ في جلب الرحلات:", error);
    res.status(500).json({ error: "خطأ في الخادم أثناء جلب الرحلات." });
  }
};

const DeleteClientFromTrip = async (req, res) => {
  try {
    const { tripId, clientId } = req.params;

    // Validate IDs
    if (
      !mongoose.Types.ObjectId.isValid(tripId) ||
      !mongoose.Types.ObjectId.isValid(clientId)
    ) {
      return res
        .status(400)
        .json({ error: "Invalid Trip or Client ID format" });
    }

    // Find the trip
    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }

    // Find the client in the trip
    const clientIndex = trip.clients.findIndex(
      (c) => c.client.toString() === clientId
    );

    if (clientIndex === -1) {
      return res.status(404).json({ error: "Client not found in this trip" });
    }

    // Get the client data before removing
    const clientData = trip.clients[clientIndex];

    // Remove the client from the trip
    trip.clients.splice(clientIndex, 1);

    // Update trip totals
    trip.totalTripCost -= clientData.totalCost || 0;
    trip.totalTripPaid -= clientData.totalPaid || 0;
    trip.totalTripNetAmount = trip.totalTripCost - trip.totalTripPaid;

    // Save the updated trip
    await trip.save();

    // Remove the trip from the client's bookings
    await Client.findByIdAndUpdate(
      clientId,
      { $pull: { bookings: tripId } },
      { new: true }
    );

    res.json({
      message: "Client removed from trip successfully",
      updatedTrip: trip,
    });
  } catch (error) {
    console.error("Error removing client from trip:", error);
    res.status(500).json({ error: error.message });
  }
};

const UpdateClientOnTrip = async (req, res) => {
  try {
    const { tripId, clientId } = req.params;
    const updateData = req.body;

    // Validate IDs
    if (
      !mongoose.Types.ObjectId.isValid(tripId) ||
      !mongoose.Types.ObjectId.isValid(clientId)
    ) {
      return res
        .status(400)
        .json({ error: "Invalid Trip or Client ID format" });
    }

    // Find the trip
    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }

    // Find the client in the trip
    const clientInTrip = trip.clients.find(
      (c) => c.client.toString() === clientId
    );

    if (!clientInTrip) {
      return res.status(404).json({ error: "Client not found in this trip" });
    }

    // Calculate differences for totals
    const oldCost = clientInTrip.totalCost || 0;
    const oldPaid = clientInTrip.totalPaid || 0;

    // Update client data
    if (updateData.accompanyingPersons !== undefined) {
      clientInTrip.accompanyingPersons = updateData.accompanyingPersons;
    }
    if (updateData.returnStatus !== undefined) {
      clientInTrip.returnStatus = updateData.returnStatus;
    }
    if (updateData.returnDate !== undefined) {
      clientInTrip.returnDate =
        updateData.returnStatus === "نعم" ? updateData.returnDate : undefined;
    }
    if (updateData.totalCost !== undefined) {
      clientInTrip.totalCost = updateData.totalCost;
    }
    if (updateData.totalPaid !== undefined) {
      clientInTrip.totalPaid = updateData.totalPaid;
    }
    if (updateData.boardingLocation !== undefined) {
      clientInTrip.boardingLocation = updateData.boardingLocation;
      // Update the client's boarding location as well
      await Client.findByIdAndUpdate(
        clientId,
        { boardingLocation: updateData.boardingLocation },
        { new: true }
      );
    }

    // Calculate new net amount
    clientInTrip.netAmount =
      (clientInTrip.totalCost || 0) - (clientInTrip.totalPaid || 0);

    // Update trip totals
    trip.totalTripCost =
      trip.totalTripCost - oldCost + (clientInTrip.totalCost || 0);
    trip.totalTripPaid =
      trip.totalTripPaid - oldPaid + (clientInTrip.totalPaid || 0);
    trip.totalTripNetAmount = trip.totalTripCost - trip.totalTripPaid;

    // Save the updated trip
    await trip.save();

    res.json({
      message: "Client data updated successfully",
      updatedTrip: trip,
    });
  } catch (error) {
    console.error("Error updating client in trip:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
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
  UpdateClientOnTrip,
  DeleteClientFromTrip,
};

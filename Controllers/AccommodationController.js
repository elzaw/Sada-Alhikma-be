const { Accommodation } = require("../Models/AccommodationModel");

const createAccommodation = async (req, res, next) => {
  try {
    const { tripId, supervisorName, supervisorPhone, groups, roomCounts } =
      req.body;

    // تحقق مما إذا كان هناك تسكين  موجود لهذه الرحلة
    let existingAccommodation = await Accommodation.findOne({ tripId });

    if (existingAccommodation) {
      // تحديث التسكين بدلاً من إنشاء واحد جديد
      existingAccommodation.supervisorName = supervisorName;
      existingAccommodation.supervisorPhone = supervisorPhone;
      existingAccommodation.groups = groups;
      existingAccommodation.roomCounts = roomCounts;

      await existingAccommodation.save();
      return res.status(200).json({
        message: "تم تحديث التسكين بنجاح",
        accommodation: existingAccommodation,
      });
    }

    // إنشاء تسكين جديد إذا لم يكن موجودًا
    const newAccommodation = new Accommodation({
      tripId,
      supervisorName,
      supervisorPhone,
      groups,
      roomCounts,
    });

    await newAccommodation.save();
    res.status(201).json({
      message: "تم حفظ بيانات التسكين بنجاح",
      accommodation: newAccommodation,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "حدث خطأ أثناء حفظ التسكين", details: error.message });
  }
};

const getAccommodationByTripId = async (req, res, next) => {
  try {
    const { tripId } = req.params;
    const accommodation = await Accommodation.findOne({ tripId }).populate(
      "groups.rooms.clientId"
    );

    if (!accommodation) {
      return res
        .status(404)
        .json({ message: "لم يتم العثور على بيانات التسكين لهذه الرحلة" });
    }

    res.json(accommodation);
  } catch (error) {
    res
      .status(500)
      .json({ error: "حدث خطأ أثناء جلب البيانات", details: error.message });
  }
};

module.exports = { createAccommodation, getAccommodationByTripId };

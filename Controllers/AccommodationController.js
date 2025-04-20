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

const updateClientInGroup = async (req, res, next) => {
  try {
    const { tripId, groupName, roomIndex, clientId } = req.params;
    const { name, identity } = req.body;

    const accommodation = await Accommodation.findOne({ tripId });
    if (!accommodation) {
      return res
        .status(404)
        .json({ message: "لم يتم العثور على بيانات التسكين لهذه الرحلة" });
    }

    const group = accommodation.groups.find((g) => g.name === groupName);
    if (!group) {
      return res
        .status(404)
        .json({ message: "لم يتم العثور على المجموعة المطلوبة" });
    }

    if (roomIndex >= group.rooms.length) {
      return res
        .status(404)
        .json({ message: "لم يتم العثور على الغرفة المطلوبة" });
    }

    // Update client information
    group.rooms[roomIndex].name = name;
    group.rooms[roomIndex].identity = identity;

    await accommodation.save();
    res.json({
      message: "تم تحديث بيانات العميل بنجاح",
      accommodation,
    });
  } catch (error) {
    res.status(500).json({
      error: "حدث خطأ أثناء تحديث بيانات العميل",
      details: error.message,
    });
  }
};

const deleteClientFromGroup = async (req, res, next) => {
  try {
    const { tripId, groupName, roomIndex } = req.params;

    const accommodation = await Accommodation.findOne({ tripId });
    if (!accommodation) {
      return res
        .status(404)
        .json({ message: "لم يتم العثور على بيانات التسكين لهذه الرحلة" });
    }

    const group = accommodation.groups.find((g) => g.name === groupName);
    if (!group) {
      return res
        .status(404)
        .json({ message: "لم يتم العثور على المجموعة المطلوبة" });
    }

    if (roomIndex >= group.rooms.length) {
      return res
        .status(404)
        .json({ message: "لم يتم العثور على الغرفة المطلوبة" });
    }

    // Remove the client from the room
    group.rooms[roomIndex].clientId = null;
    group.rooms[roomIndex].name = null;
    group.rooms[roomIndex].identity = null;

    await accommodation.save();
    res.json({
      message: "تم حذف العميل من الغرفة بنجاح",
      accommodation,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "حدث خطأ أثناء حذف العميل", details: error.message });
  }
};

const deleteGroup = async (req, res, next) => {
  try {
    const { tripId, groupName } = req.params;

    const accommodation = await Accommodation.findOne({ tripId });
    if (!accommodation) {
      return res
        .status(404)
        .json({ message: "لم يتم العثور على بيانات التسكين لهذه الرحلة" });
    }

    // Find the index of the group to delete
    const groupIndex = accommodation.groups.findIndex(
      (g) => g.name === groupName
    );
    if (groupIndex === -1) {
      return res
        .status(404)
        .json({ message: "لم يتم العثور على المجموعة المطلوبة" });
    }

    // Remove the group from the array
    accommodation.groups.splice(groupIndex, 1);

    await accommodation.save();
    res.json({
      message: "تم حذف المجموعة بنجاح",
      accommodation,
    });
  } catch (error) {
    res.status(500).json({
      error: "حدث خطأ أثناء حذف المجموعة",
      details: error.message,
    });
  }
};

module.exports = {
  createAccommodation,
  getAccommodationByTripId,
  updateClientInGroup,
  deleteClientFromGroup,
  deleteGroup,
};

import asyncHandler from "../../middlewares/asyncHandler.js";
import Notification from "../../models/notification.js";

const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({
    audience: "customer",
    recipient: req.customer._id,
  })
    .sort({ createdAt: -1 })
    .limit(25);

  res.status(200).json({
    success: true,
    data: notifications,
  });
});

const markRead = asyncHandler(async (req, res) => {
  const filter = {
    audience: "customer",
    recipient: req.customer._id,
  };

  if (req.params.id) {
    filter._id = req.params.id;
  }

  await Notification.updateMany(filter, { read: true });

  res.status(200).json({
    success: true,
    message: "Notifications marked as read",
  });
});

export default { getNotifications, markRead };

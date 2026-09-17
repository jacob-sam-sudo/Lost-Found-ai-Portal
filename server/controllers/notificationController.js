import Notification from "../models/Notification.js";

// Get current user's notifications
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipient: req.user.id,
    })
      .populate("item", "title status image")
      .populate(
        "matchedItem",
        "title description category status location date image owner"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json(notifications);
  } catch (error) {
    console.error(
      "Get notifications error:",
      error
    );

    return res.status(500).json({
      message: "Unable to fetch notifications.",
    });
  }
};

// Mark one notification as read
export const markNotificationAsRead = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const notification =
      await Notification.findOne({
        _id: id,
        recipient: req.user.id,
      });

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found.",
      });
    }

    notification.read = true;

    await notification.save();

    return res.status(200).json({
      message: "Notification marked as read.",
      notification,
    });
  } catch (error) {
    console.error(
      "Mark notification as read error:",
      error
    );

    return res.status(500).json({
      message: "Unable to update notification.",
    });
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (
  req,
  res
) => {
  try {
    await Notification.updateMany(
      {
        recipient: req.user.id,
        read: false,
      },
      {
        $set: {
          read: true,
        },
      }
    );

    return res.status(200).json({
      message:
        "All notifications marked as read.",
    });
  } catch (error) {
    console.error(
      "Mark all notifications as read error:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to update notifications.",
    });
  }
};
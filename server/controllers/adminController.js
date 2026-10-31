import User from "../models/User.js";
import Item from "../models/Item.js";
import Match from "../models/Match.js";
import Notification from "../models/Notification.js";
import ActivityLog from "../models/ActivityLog.js";
import cloudinary from "../config/cloudinary.js";


// Get Admin Dashboard Statistics and Analytics
export const getDashboardStats = async (req, res) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);

    const [
      totalUsers,
      totalItems,
      lostItems,
      foundItems,
      returnedItems,
      totalMatches,
      potentialMatches,
      confirmedMatches,
      rejectedMatches,
      monthlyItems,
      monthlyUsers,
    ] = await Promise.all([
      User.countDocuments(),
      Item.countDocuments(),
      Item.countDocuments({ status: "lost" }),
      Item.countDocuments({ status: "found" }),
      Item.countDocuments({ status: "returned" }),
      Match.countDocuments(),
      Match.countDocuments({ status: "potential" }),
      Match.countDocuments({ status: "confirmed" }),
      Match.countDocuments({ status: "rejected" }),

      // Monthly item trends
      Item.aggregate([
        {
          $match: {
            createdAt: { $gte: sixMonthsAgo },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
              status: "$status",
            },
            count: { $sum: 1 },
          },
        },
        {
          $sort: {
            "_id.year": 1,
            "_id.month": 1,
          },
        },
      ]),

      // Monthly user registrations
      User.aggregate([
        {
          $match: {
            createdAt: { $gte: sixMonthsAgo },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
        {
          $sort: {
            "_id.year": 1,
            "_id.month": 1,
          },
        },
      ]),
    ]);

    // Match success rate among resolved matches
    const resolvedMatches = confirmedMatches + rejectedMatches;

    const matchSuccessRate =
      resolvedMatches > 0
        ? Number(((confirmedMatches / resolvedMatches) * 100).toFixed(2))
        : 0;

    // Format monthly analytics with all six months,
    // including months with zero activity
    const monthlyAnalytics = [];

    for (let i = 0; i < 6; i++) {
      const monthDate = new Date(sixMonthsAgo);
      monthDate.setMonth(monthDate.getMonth() + i);

      const year = monthDate.getFullYear();
      const month = monthDate.getMonth() + 1;

      const itemData = monthlyItems.filter(
        (entry) =>
          entry._id.year === year && entry._id.month === month
      );

      const userData = monthlyUsers.find(
        (entry) =>
          entry._id.year === year && entry._id.month === month
      );

      const getItemCount = (status) =>
        itemData.find((entry) => entry._id.status === status)?.count || 0;

      monthlyAnalytics.push({
        month: monthDate.toLocaleString("en-US", {
          month: "short",
          year: "numeric",
        }),
        lost: getItemCount("lost"),
        found: getItemCount("found"),
        returned: getItemCount("returned"),
        users: userData?.count || 0,
      });
    }

    res.status(200).json({
      success: true,

      stats: {
        users: {
          total: totalUsers,
        },

        items: {
          total: totalItems,
          lost: lostItems,
          found: foundItems,
          returned: returnedItems,
        },

        matches: {
          total: totalMatches,
          potential: potentialMatches,
          confirmed: confirmedMatches,
          rejected: rejectedMatches,
          successRate: matchSuccessRate,
        },

        analytics: {
          monthly: monthlyAnalytics,
        },
      },
    });
  } catch (error) {
    console.error("Admin Dashboard Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard statistics",
    });
  }
};


// Get all registered users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Get Users Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};

// Get all items for admin management
export const getAdminItems = async (req, res) => {
  try {
    const { search, status, category } = req.query;

    const filter = {};

    // Filter by status
    if (status && status !== "all") {
      filter.status = status;
    }

    // Filter by category
    if (category && category !== "all") {
      filter.category = category;
    }

    // Search by title, description or location
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
      ];
    }

    const items = await Item.find(filter)
      .populate("owner", "name email avatar")
      .select("-imageEmbedding -aiMatches")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: items.length,
      items,
    });

  } catch (error) {
    console.error("Admin Get Items Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch items",
    });
  }
};


// Delete an item and its related records (Admin only)
export const deleteAdminItem = async (req, res) => {
  try {
    const { id } = req.params;

    // Check whether the item exists
    const item = await Item.findById(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    // Delete the image from Cloudinary
    let cloudinaryResult = "no_image";

    if (item.image) {
      try {
        // Extract Cloudinary public ID from the image URL
        const imageUrl = new URL(item.image);
        const pathname = imageUrl.pathname;

        const uploadIndex = pathname.indexOf("/upload/");

        if (uploadIndex !== -1) {
          let publicId = pathname.substring(uploadIndex + 8);

          // Remove version number (v123456789/)
          publicId = publicId.replace(/^v\d+\//, "");

          // Remove file extension
          publicId = publicId.replace(/\.[^/.]+$/, "");

          const result = await cloudinary.uploader.destroy(publicId);

          cloudinaryResult = result.result;

          if (result.result !== "ok" && result.result !== "not found") {
            console.error("Cloudinary deletion result:", result);
          }
        } else {
          cloudinaryResult = "invalid_image_url";
          console.warn("Could not extract Cloudinary public ID:", item.image);
        }
      } catch (cloudinaryError) {
        cloudinaryResult = "failed";
        console.error(
          "Cloudinary image deletion failed:",
          cloudinaryError
        );
      }
    }

    // Delete all matches involving this item
    const deletedMatches = await Match.deleteMany({
      $or: [
        { lostItem: id },
        { foundItem: id },
      ],
    });

    // Delete all notifications involving this item
    const deletedNotifications = await Notification.deleteMany({
      $or: [
        { item: id },
        { matchedItem: id },
      ],
    });

    // Delete the item
    await Item.findByIdAndDelete(id);

    // Create activity log
    try {
      await ActivityLog.create({
        admin: req.user._id,
        action: "ITEM_DELETED",
        targetType: "Item",
        targetId: item._id,
        targetName: item.title,
        details: `Deleted item "${item.title}" and its related records`,
      });
    } catch (logError) {
      console.error("Failed to create item deletion activity log:", logError);
    }

    res.status(200).json({
      success: true,
      message: "Item and related records deleted successfully",
      cloudinary: cloudinaryResult,
      deleted: {
        matches: deletedMatches.deletedCount,
        notifications: deletedNotifications.deletedCount,
      },
    });

  } catch (error) {
    console.error("Admin Delete Item Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete item",
    });
  }
};



// Update a user's role (Admin only)
export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Validate requested role
    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Role must be either user or admin",
      });
    }

    // Prevent an admin from changing their own role
    if (req.user._id.toString() === id) {
      return res.status(400).json({
        success: false,
        message: "You cannot change your own role",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent demoting the last remaining admin
    if (user.role === "admin" && role === "user") {
      const adminCount = await User.countDocuments({
        role: "admin",
      });

      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: "Cannot demote the last remaining admin",
        });
      }
    }

    // Store the previous role
    const previousRole = user.role;

    user.role = role;
    await user.save();

    // Create activity log only when the role actually changes
    if (previousRole !== role) {
      try {
        await ActivityLog.create({
          admin: req.user._id,
          action:
            role === "admin"
              ? "USER_PROMOTED"
              : "USER_DEMOTED",
          targetType: "User",
          targetId: user._id,
          targetName: user.name,
          details: `Changed ${user.name}'s role from ${previousRole} to ${role}`,
          previousValue: previousRole,
          newValue: role,
        });
      } catch (logError) {
        console.error("Failed to create activity log:", logError);
      }
    }

    res.status(200).json({
      success: true,
      message: `User role updated to ${role} successfully`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Update User Role Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update user role",
    });
  }
};


// Get all matches for admin management
export const getAdminMatches = async (req, res) => {
  try {
    const { search, status } = req.query;

    const filter = {};

    if (
      status &&
      ["potential", "confirmed", "rejected", "returned"].includes(status)
    ) {
      filter.status = status;
    }

    let matches = await Match.find(filter)
      .populate({
        path: "lostItem",
        select: "title category location image status owner",
        populate: {
          path: "owner",
          select: "name email",
        },
      })
      .populate({
        path: "foundItem",
        select: "title category location image status owner",
        populate: {
          path: "owner",
          select: "name email",
        },
      })
      .sort({ createdAt: -1 });

    // Search across associated item titles and locations
    if (search) {
      const query = search.toLowerCase();

      matches = matches.filter((match) => {
        const lostItem = match.lostItem;
        const foundItem = match.foundItem;

        return (
          lostItem?.title?.toLowerCase().includes(query) ||
          lostItem?.location?.toLowerCase().includes(query) ||
          foundItem?.title?.toLowerCase().includes(query) ||
          foundItem?.location?.toLowerCase().includes(query)
        );
      });
    }

    return res.status(200).json({
      success: true,
      count: matches.length,
      matches,
    });
  } catch (error) {
    console.error("Admin Get Matches Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch matches",
    });
  }
};

// Get admin activity logs
export const getActivityLogs = async (req, res) => {
  try {
    const logs = await ActivityLog.find()
      .populate("admin", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: logs.length,
      logs,
    });
  } catch (error) {
    console.error("Get Activity Logs Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch activity logs",
    });
  }
};

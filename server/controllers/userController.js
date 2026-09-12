import User from "../models/User.js";
import cloudinary
from "../config/cloudinary.js";
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        name,
      },
      {
        new: true,
      }
    ).select("-password");

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const uploadAvatar = async (req, res) => {
  try {

    console.log("FILE:", req.file);

    const result =
      await cloudinary.uploader.upload(
        req.file.path
      );

    const user =
      await User.findByIdAndUpdate(
        req.user.id,
        {
          avatar: result.secure_url,
        },
        {
          new: true,
        }
      ).select("-password");
      console.log("RETURNED USER:", user);

    res.json({
      success: true,
      user,
    });

  } catch (error) {

    console.error("UPLOAD ERROR:");
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
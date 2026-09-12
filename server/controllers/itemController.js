import Item from "../models/Item.js";
import cloudinary from "../config/cloudinary.js";


    // Rest of your code...
// CREATE ITEM

export const createItem = async (req, res) => {
  try {
    const { title, description, category, status, location, date } = req.body;

    let imageUrl = "";

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "lost-found-items",
      });

      imageUrl = result.secure_url;
    }

    const item = await Item.create({
      title,
      description,
      category,
      status,
      location,
      date,
      image: imageUrl,
      owner: req.user._id,
    });

    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// GET ALL ITEMS

export const getItems = async (req, res) => {
  try {
    const items = await Item.find()
      .populate("owner", "name email avatar")
      .sort({ createdAt: -1 });

    res.json(items);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// GET SINGLE ITEM

export const getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate("owner", "name email avatar");

    if (!item) {
      return res.status(404).json({
        message: "Item not found",
      });
    }

    res.json(item);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// UPDATE ITEM

export const updateItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        message: "Item not found",
      });
    }

    // Check ownership
    if (item.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }

    // Update text fields
    item.title = req.body.title ?? item.title;
    item.description = req.body.description ?? item.description;
    item.category = req.body.category ?? item.category;
    item.status = req.body.status ?? item.status;
    item.location = req.body.location ?? item.location;
    item.date = req.body.date ?? item.date;

    // Update image if a new one was uploaded
    if (req.file) {
      const result = await cloudinary.uploader.upload(
        req.file.path,
        {
          folder: "lost-found-items",
        }
      );

      item.image = result.secure_url;
    }

    const updatedItem = await item.save();

    res.status(200).json({
      message: "Item updated successfully",
      item: updatedItem,
    });
  } catch (error) {
    console.error("Update item error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// DELETE ITEM

export const deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        message: "Item not found",
      });
    }

    if (item.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }

    await item.deleteOne();

    res.json({
      message: "Item deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// MY ITEMS

export const getMyItems = async (req, res) => {
  try {
    const items = await Item.find({
      owner: req.user._id,
    }).sort({ createdAt: -1 });

    res.json(items);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
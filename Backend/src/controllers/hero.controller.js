import heroModel from "../models/hero.model.js";
import { uploadFiles } from "../services/storage.service.js";

export const createHero = async (req, res) => {
  try {
    const files = req.files || [];

    if (files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please upload at least one hero image",
      });
    }

    if (files.length > 5) {
      return res.status(400).json({
        success: false,
        message: "Maximum 5 hero images are allowed",
      });
    }

    // Upload images to ImageKit
    const images = await Promise.all(
      files.map(async (file) => {
        const result = await uploadFiles({
          buffer: file.buffer,
          fileName: file.originalname,
          folder: "snitch/hero",
        });

        return {
          url: result.url,
        };
      })
    );

    // Deactivate previous hero
    await heroModel.updateMany(
      { isActive: true },
      {
        $set: {
          isActive: false,
        },
      }
    );

    // Create new hero
    const hero = await heroModel.create({
      images,
      isActive: true,
    });

    return res.status(201).json({
      success: true,
      message: "Hero banner updated successfully",
      hero,
    });
  } catch (error) {
    console.error("Create Hero Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create hero banner",
      error: error.message,
    });
  }
};

export const getActiveHero = async (req, res) => {
  try {
    const hero = await heroModel
      .findOne({
        isActive: true,
      })
      .sort({
        updatedAt: -1,
      });

    return res.status(200).json({
      success: true,
      hero,
    });
  } catch (error) {
    console.error("Get Hero Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get hero banner",
      error: error.message,
    });
  }
};
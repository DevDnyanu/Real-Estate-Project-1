import { Router } from "express";
import multer from "multer";
import { GridFsStorage } from "multer-gridfs-storage";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import dotenv from "dotenv";

import {
  createListing,
  getListings,
  getListing,
  updateListing,
  deleteListing,
  uploadImages,
  deleteImages,
  getImage
} from "../controllers/listingController.js";

dotenv.config();

const router = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MongoDB connection setup
const mongoURI = process.env.MONGODB_URI;

// Create storage engine for GridFS
const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${file.originalname}`;
      const fileInfo = {
        filename: filename,
        bucketName: "images", // This will be the collection name in MongoDB
        metadata: {
          listingId: req.params.listingId // Store listing ID as metadata
        }
      };
      resolve(fileInfo);
    });
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 6, // Max 6 files
  },
});

// CRUD routes
router.post("/", createListing);
router.get("/", getListings);
router.get("/:id", getListing);
router.put("/:id", updateListing);
router.delete("/:id", deleteListing);

// Image handling routes
router.post("/:listingId/upload-images", upload.array("images", 6), uploadImages);
router.delete("/:listingId/images", deleteImages);
router.get("/image/:id", getImage); // Route to retrieve images

export default router;
import { Router } from "express";
import {
  createListing,
  getListings,
  getListing,
  updateListing,
  deleteListing,
  // uploadImages,
} from "../controllers/listingController.js";

// ================== MULTER (COMMENTED FOR NOW) ================== //
// import multer from "multer";
// import path from "path";
// import { fileURLToPath } from "url";
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, path.join(__dirname, "../../uploads")),
//   filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
// });
// const upload = multer({ storage });
// ================================================================ //

const router = Router();

// CRUD
router.post("/create", createListing);
router.get("/", getListings);
router.get("/:id", getListing);
router.put("/:id", updateListing);
router.delete("/:id", deleteListing);

// Image upload (enable later)
// router.post("/upload-images", upload.array("images", 6), uploadImages);

export default router;

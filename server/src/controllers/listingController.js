import Listing from "../models/Listing.js";

/** Create listing (TEXT DATA ONLY) */
export const createListing = async (req, res, next) => {
  try {
    const listing = await Listing.create(req.body);
    return res.status(201).json({
      success: true,
      message: "Listing created",
      listingId: listing._id,
      data: listing,
    });
  } catch (err) {
    next(err);
  }
};

/** Get all listings */
export const getListings = async (req, res, next) => {
  try {
    const listings = await Listing.find().sort({ createdAt: -1 });
    return res.json({ 
      success: true, 
      listings // यहाँ 'data' के बजाय 'listings' भेज रहे हैं
    });
  } catch (err) {
    next(err);
  }
};

/** Get single listing */
export const getListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ success: false, message: "Not found" });
    return res.json({ success: true, data: listing });
  } catch (err) {
    next(err);
  }
};

/** Update listing (TEXT DATA ONLY) */
export const updateListing = async (req, res, next) => {
  try {
    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedListing) return res.status(404).json({ success: false, message: "Not found" });
    return res.json({ success: true, message: "Updated", data: updatedListing });
  } catch (err) {
    next(err);
  }
};

/** Delete listing */
export const deleteListing = async (req, res, next) => {
  try {
    const deletedListing = await Listing.findByIdAndDelete(req.params.id);
    if (!deletedListing) return res.status(404).json({ success: false, message: "Not found" });
    return res.json({ success: true, message: "Deleted" });
  } catch (err) {
    next(err);
  }
};

/** ================= IMAGE UPLOAD (COMMENTED FOR NOW) ================= */
// import path from "path";
// import { fileURLToPath } from "url";
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Save image URLs into document after upload
// export const uploadImages = async (req, res, next) => {
//   try {
//     const { listingId } = req.body;
//     if (!listingId) return res.status(400).json({ success: false, message: "listingId required" });
//     if (!req.files || req.files.length === 0) {
//       return res.status(400).json({ success: false, message: "No files uploaded" });
//     }
//     const imageUrls = req.files.map(f => `/uploads/${path.basename(f.path)}`);
//     const updated = await Listing.findByIdAndUpdate(
//       listingId,
//       { $push: { images: { $each: imageUrls } } },
//       { new: true }
//     );
//     return res.json({ success: true, message: "Images added", data: updated });
//   } catch (err) {
//     next(err);
//   }
// };

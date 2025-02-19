


const express = require("express");
const multer = require("multer");
const vendorController = require("../controllers/vendorController");

const router = express.Router();

// Multer config for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Register vendor (with image uploads)
router.post(
  "/register",
  upload.fields([{ name: "exterior_image" }, { name: "interior_image" }]),
  vendorController.registerVendor
);

// Fetch all vendors
router.get("/", vendorController.getVendors);

// Fetch single vendor by ID
router.get("/:id", vendorController.getVendorById);

module.exports = router;





// const express = require("express");
// const multer = require("multer");
// const vendorController = require("../controllers/vendorController");

// const router = express.Router();

// // Multer config for handling file uploads
// const storage = multer.memoryStorage();
// const upload = multer({ storage: storage });

// // Register vendor (with image uploads)
// router.post(
//   "/register",
//   upload.fields([{ name: "exterior_image" }, { name: "interior_image" }]),
//   vendorController.registerVendor
// );

// // Fetch all vendors
// router.get("/", vendorController.getVendors);

// // Fetch single vendor by ID
// router.get("/:id", vendorController.getVendorById);

// module.exports = router;



const express = require("express");
const { registerVendor, getAllVendors, approveVendor, rejectVendor, updateVendorDetails } = require("../controllers/vendorController");


const router = express.Router();

// Register Vendor (expects image URLs in request body)
router.post("/register", registerVendor);




// Get All Vendors (Admin Only)
router.get("/admin/vendors", getAllVendors);

// Approve Vendor (Admin Only)
router.post("/admin/approve-vendor/:vendorId", approveVendor);

// Reject Vendor (Admin Only)
router.post("/admin/reject-vendor/:vendorId", rejectVendor);

// Update Vendor Details (Admin Only)
router.put("/admin/update-vendor/:vendorId", updateVendorDetails);

// Get Single Vendor by ID
// router.get("/:id", getVendorById);

module.exports = router;

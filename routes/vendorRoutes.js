



const express = require("express");
const { registerVendor, getAllVendors, approveVendor, rejectVendor, updateVendorDetails, getVendorById, loginVendor } = require("../controllers/vendorController");


const router = express.Router();

// Register Vendor (expects image URLs in request body)
router.post("/register", registerVendor);

router.post("/admin/login", loginVendor);


// Get All Vendors (Admin Only)
router.get("/admin/vendors", getAllVendors);


// Approve Vendor (Admin Only)
router.post("/admin/approve-vendor/:vendorId", approveVendor);

// Reject Vendor (Admin Only)
router.post("/admin/reject-vendor/:vendorId", rejectVendor);

// Update Vendor Details (Admin Only)
router.put("/admin/update-vendor/:vendorId", updateVendorDetails);

// Get Single Vendor by ID
router.get('/vendors/:id', getVendorById);

module.exports = router;

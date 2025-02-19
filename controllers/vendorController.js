

const bcrypt = require("bcrypt");
const pool = require("../config/db");

// Register a new vendor


const registerVendor = async (req, res) => {
  try {
    const {
      name,
      enterprise_name,
      email,
      contact_number,
      state,
      city,
      pincode,
      full_address,
      service_type,
      years_of_experience,
      personal_intro,
      password, 
    } = req.body;

    // Hash the password (using bcrypt with 10 salt rounds)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Get images from request
    const exteriorImage = req.files?.["exterior_image"]?.[0]?.buffer || null;
    const interiorImage = req.files?.["interior_image"]?.[0]?.buffer || null;

    // Insert data into the database
    const result = await pool.query(
      `INSERT INTO vendors (
        name, enterprise_name, email, contact_number, state, city, pincode, 
        full_address, service_type, exterior_image, interior_image, years_of_experience, 
        personal_intro, password
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) 
      RETURNING *`,
      [
        name,
        enterprise_name,
        email,
        contact_number,
        state,
        city,
        pincode,
        full_address,
        service_type,
        exteriorImage,
        interiorImage,
        years_of_experience,
        personal_intro,
        hashedPassword,
      ]
    );

    res.status(201).json({
      message: "Vendor registered successfully",
      vendor: result.rows[0],
    });
  } catch (error) {
    console.error("Error registering vendor:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all vendors


const getVendors = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM vendors");
    const vendors = result.rows.map((vendor) => ({
      ...vendor,
      exterior_image: vendor.exterior_image ? Buffer.from(vendor.exterior_image).toString("base64") : null,
      interior_image: vendor.interior_image ? Buffer.from(vendor.interior_image).toString("base64") : null,
    }));

    res.json(vendors);
  } catch (err) {
    console.error("Error fetching vendors:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get vendor by ID
const getVendorById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM vendors WHERE id = $1", [
      id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    const vendor = result.rows[0];

    // Convert images to base64 before sending response
    vendor.exterior_image = vendor.exterior_image
      ? `data:image/png;base64,${vendor.exterior_image.toString("base64")}`
      : null;
    vendor.interior_image = vendor.interior_image
      ? `data:image/png;base64,${vendor.interior_image.toString("base64")}`
      : null;

    res.json(vendor);
  } catch (error) {
    console.error("Error fetching vendor:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};





module.exports = { registerVendor, getVendors, getVendorById };

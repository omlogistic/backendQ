const bcrypt = require("bcrypt");
const pool = require("../config/db");
const axios = require("axios");

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
      exterior_image,
      interior_image,
    } = req.body;

    const exteriorImageUrl = exterior_image ? String(exterior_image) : null;
    const interiorImageUrl = interior_image ? String(interior_image) : null;
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert into database
    const result = await pool.query(
      `INSERT INTO vendors (
        name, enterprise_name, email, contact_number, state, city, pincode, 
        full_address, service_type, exterior_image, interior_image, years_of_experience, 
        personal_intro, password, status
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) 
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
        exteriorImageUrl,
        interiorImageUrl,
        years_of_experience,
        personal_intro,
        hashedPassword,
        'pending'  // Default status
      ]
    );

    res.status(201).json({
      message: "Vendor registered successfully, awaiting admin approval.",
      vendor: result.rows[0],
    });
  } catch (error) {
    console.error("Error registering vendor:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getAllVendors = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM vendors ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching all vendors:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getVendorById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM vendors WHERE id = $1", [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching vendor by ID:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const approveVendor = async (req, res) => {
  const { vendorId } = req.params;
  try {
    const result = await pool.query(
      "UPDATE vendors SET status = 'approved' WHERE id = $1 RETURNING *",
      [vendorId]
    );
    res.json({ message: "Vendor approved successfully", vendor: result.rows[0] });
  } catch (err) {
    console.error("Error approving vendor:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const rejectVendor = async (req, res) => {
  const { vendorId } = req.params;
  try {
    const result = await pool.query(
      "UPDATE vendors SET status = 'rejected' WHERE id = $1 RETURNING *",
      [vendorId]
    );
    res.json({ message: "Vendor rejected successfully", vendor: result.rows[0] });
  } catch (err) {
    console.error("Error rejecting vendor:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


const updateVendorDetails = async (req, res) => {
  const { vendorId } = req.params;
  const {
    name,
    contact_number,
    state,
    city,
    pincode,
    full_address,
    service_type,
    years_of_experience,
    personal_intro,
    exterior_image,
    interior_image
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE vendors SET 
        name = $1, 
        contact_number = $2, 
        state = $3, 
        city = $4, 
        pincode = $5, 
        full_address = $6, 
        service_type = $7, 
        years_of_experience = $8, 
        personal_intro = $9, 
        exterior_image = $10,
        interior_image = $11
      WHERE id = $12 
      RETURNING id, name, contact_number, state, city, pincode, full_address, service_type, years_of_experience, personal_intro, exterior_image, interior_image`,
      [
        name,
        contact_number,
        state,
        city,
        pincode,
        full_address,
        service_type,
        years_of_experience,
        personal_intro,
        exterior_image,
        interior_image,
        vendorId,
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    res.json({ message: "Vendor details updated successfully", vendor: result.rows[0] });
  } catch (err) {
    console.error("Error updating vendor details by admin:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const loginVendor = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    // Check if the vendor exists
    const result = await pool.query(
      `SELECT id, name, enterprise_name, email, password, status FROM vendors WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Vendor not found." });
    }

    const vendor = result.rows[0];

    // Check password
    const isMatch = await bcrypt.compare(password, vendor.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // Check if vendor is approved
    if (vendor.status !== 'approved') {
      return res.status(403).json({ message: "Account is not approved by admin." });
    }

    // Construct the response data
    const vendorData = {
      id: vendor.id,
      name: vendor.name,
      enterprise_name: vendor.enterprise_name,
      email: vendor.email,
      status: vendor.status
    };

    res.status(200).json({
      message: "Login successful.",
      vendor: vendorData
    });
  } catch (error) {
    console.error("Error logging in vendor:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getAddressByPincode = async (req, res) => {
  try {
      const { pincode } = req.query;

      if (!pincode) {
          return res.status(400).json({ error: "Pincode is required" });
      }

      const response = await axios.get(
          `https://nominatim.openstreetmap.org/search`,
          {
              params: {
                  postalcode: pincode,
                  countrycodes: "IN", // Change if needed
                  format: "json"
              }
          }
      );

      if (!response.data || response.data.length === 0) {
          return res.status(404).json({ error: "Address not found" });
      }

      res.json(response.data);
  } catch (error) {
      console.error("Error fetching address:", error.message); // Logs error in the console
      res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
};




module.exports = { registerVendor,getVendorById , getAllVendors,approveVendor,rejectVendor, updateVendorDetails, loginVendor,getAddressByPincode };


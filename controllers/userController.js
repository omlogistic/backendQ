const bcrypt = require("bcrypt");
const pool = require("../config/db");
const { validationResult } = require("express-validator");

// User Signup
const signupUser = async (req, res) => {
  try {
    const { name, mobile_number, email, city, password } = req.body;

    // Validate input
    if (!name || !mobile_number || !email || !city || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user exists
    const userExists = await pool.query("SELECT * FROM userquery WHERE email = $1", [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into database
    const result = await pool.query(
      `INSERT INTO userquery (name, mobile_number, email, city, password) 
      VALUES ($1, $2, $3, $4, $5) RETURNING id, name, mobile_number, email, city`,
      [name, mobile_number, email, city, hashedPassword]
    );

    res.status(201).json({ message: "User registered successfully", user: result.rows[0] });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// User Login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Check if user exists
    const user = await pool.query("SELECT * FROM userquery WHERE email = $1", [email]);
    if (user.rows.length === 0) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Validate password
    const validPassword = await bcrypt.compare(password, user.rows[0].password);
    if (!validPassword) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    res.json({ message: "Login successful", user: { id: user.rows[0].id, email: user.rows[0].email, name:user.rows[0].name } });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get User by Email
const getUserByEmail = async (req, res) => {
  try {
    const { email } = req.params;

    // Fetch user from database
    const user = await pool.query("SELECT id, name, mobile_number, email, city FROM userquery WHERE email = $1", [email]);

    if (user.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user: user.rows[0] });
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { signupUser, loginUser, getUserByEmail };

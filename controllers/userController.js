// const bcrypt = require("bcrypt");
// const pool = require("../config/db");
// const { validationResult } = require("express-validator");
// const nodemailer = require("nodemailer");
// const otpGenerator = require("otp-generator");

// // User Signup
// const signupUser = async (req, res) => {
//   try {
//     const { name, mobile_number, email, city, password } = req.body;

//     // Validate input
//     if (!name || !mobile_number || !email || !city || !password) {
//       return res.status(400).json({ message: "All fields are required" });
//     }

//     // Check if user exists
//     const userExists = await pool.query("SELECT * FROM userquery WHERE email = $1", [email]);
//     if (userExists.rows.length > 0) {
//       return res.status(400).json({ message: "User already exists" });
//     }

//     // Hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Insert user into database
//     const result = await pool.query(
//       `INSERT INTO userquery (name, mobile_number, email, city, password) 
//       VALUES ($1, $2, $3, $4, $5) RETURNING id, name, mobile_number, email, city`,
//       [name, mobile_number, email, city, hashedPassword]
//     );

//     res.status(201).json({ message: "User registered successfully", user: result.rows[0] });
//   } catch (error) {
//     console.error("Error registering user:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// // User Login
// const loginUser = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // Validate input
//     if (!email || !password) {
//       return res.status(400).json({ message: "Email and password are required" });
//     }

//     // Check if user exists
//     const user = await pool.query("SELECT * FROM userquery WHERE email = $1", [email]);
//     if (user.rows.length === 0) {
//       return res.status(400).json({ message: "Invalid email or password" });
//     }

//     // Validate password
//     const validPassword = await bcrypt.compare(password, user.rows[0].password);
//     if (!validPassword) {
//       return res.status(400).json({ message: "Invalid email or password" });
//     }

//     res.json({ message: "Login successful", user: { id: user.rows[0].id, email: user.rows[0].email, name:user.rows[0].name } });
//   } catch (error) {
//     console.error("Error logging in:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// // Get User by Email
// const getUserByEmail = async (req, res) => {
//   try {
//     const { email } = req.params;

//     // Fetch user from database
//     const user = await pool.query("SELECT id, name, mobile_number, email, city FROM userquery WHERE email = $1", [email]);

//     if (user.rows.length === 0) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     res.status(200).json({ user: user.rows[0] });
//   } catch (error) {
//     console.error("Error fetching user details:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// module.exports = { signupUser, loginUser, getUserByEmail };

// const bcrypt = require("bcrypt");
// const pool = require("../config/db");
// const nodemailer = require("nodemailer");
// const otpGenerator = require("otp-generator");

// // Nodemailer transporter setup
// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL_USER,  // Your Gmail email
//     pass: process.env.EMAIL_PASS,  // Your Gmail app password
//   },
// });

// // Function to send OTP to email
// const sendOtp = async (req, res) => {
//   try {
//     const { email } = req.body;

//     if (!email) {
//       return res.status(400).json({ message: "Email is required" });
//     }

//     // Generate a 6-digit OTP
//     const otp = otpGenerator.generate(6, { digits: true, alphabets: false, specialChars: false });
//     const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // OTP expires in 5 minutes

//     // Store OTP in database (Update if exists, otherwise insert)
//     await pool.query(
//       `INSERT INTO otp_verifications (email, otp, expires_at) 
//        VALUES ($1, $2, $3) 
//        ON CONFLICT (email) DO UPDATE 
//        SET otp = EXCLUDED.otp, expires_at = EXCLUDED.expires_at`,
//       [email, otp, expiresAt]
//     );

//     // Send OTP email
//     const mailOptions = {
//       from: process.env.EMAIL_USER,
//       to: email,
//       subject: "Email Verification OTP",
//       text: `Your OTP for signup verification is: ${otp}. It is valid for 5 minutes.`,
//     };

//     await transporter.sendMail(mailOptions);

//     res.status(200).json({ message: "OTP sent successfully!" });
//   } catch (error) {
//     console.error("Error sending OTP:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// // Function to verify OTP and register user
// const verifyOtpAndSignup = async (req, res) => {
//   try {
//     const { name, mobile_number, email, city, password, otp } = req.body;

//     // Validate input
//     if (!name || !mobile_number || !email || !city || !password || !otp) {
//       return res.status(400).json({ message: "All fields are required" });
//     }

//     // Fetch OTP from database
//     const otpRecord = await pool.query("SELECT * FROM otp_verifications WHERE email = $1", [email]);

//     if (otpRecord.rows.length === 0) {
//       return res.status(400).json({ message: "OTP not found. Please request a new one." });
//     }

//     const { otp: storedOtp, expires_at } = otpRecord.rows[0];

//     // Check if OTP is expired
//     if (new Date() > new Date(expires_at)) {
//       return res.status(400).json({ message: "OTP expired. Request a new one." });
//     }

//     // Validate OTP
//     if (otp !== storedOtp) {
//       return res.status(400).json({ message: "Invalid OTP" });
//     }

//     // Delete OTP after verification
//     await pool.query("DELETE FROM otp_verifications WHERE email = $1", [email]);

//     // Check if user already exists
//     const userExists = await pool.query("SELECT * FROM userquery WHERE email = $1", [email]);
//     if (userExists.rows.length > 0) {
//       return res.status(400).json({ message: "User already exists" });
//     }

//     // Hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Insert user into database
//     const result = await pool.query(
//       `INSERT INTO userquery (name, mobile_number, email, city, password) 
//       VALUES ($1, $2, $3, $4, $5) RETURNING id, name, mobile_number, email, city`,
//       [name, mobile_number, email, city, hashedPassword]
//     );

//     res.status(201).json({ message: "Signup successful!", user: result.rows[0] });
//   } catch (error) {
//     console.error("Error during signup:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// module.exports = { sendOtp, verifyOtpAndSignup };


const bcrypt = require("bcrypt");
const pool = require("../config/db");
const nodemailer = require("nodemailer");
const otpGenerator = require("otp-generator");

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Temporary storage for user details before OTP verification
const pendingUsers = new Map(); // { email: { name, mobile_number, city, password } }

// 📌 Send OTP & Check Email
const sendOtpAndCheckEmail = async (req, res) => {
  try {
    const { name, mobile_number, email, city, password } = req.body;

    if (!name || !mobile_number || !email || !city || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if email is already registered
    const userExists = await pool.query("SELECT * FROM userquery WHERE email = $1", [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Generate a 6-digit numeric OTP
    const otp = otpGenerator.generate(6, { digits: true, alphabets: false, specialChars: false });
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // OTP expires in 5 minutes

    // Store OTP in database
    await pool.query(
      `INSERT INTO otp_verifications (email, otp, expires_at) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (email) DO UPDATE 
       SET otp = EXCLUDED.otp, expires_at = EXCLUDED.expires_at`,
      [email, otp, expiresAt]
    );

    // Store user details in temporary storage
    pendingUsers.set(email, { name, mobile_number, city, password });

    // Send OTP email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Email Verification OTP",
      text: `Your OTP for signup verification is: ${otp}. It is valid for 5 minutes.`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "OTP sent successfully!" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 📌 Verify OTP & Register User
const verifyOtpAndSignup = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    // Fetch OTP details
    const otpRecord = await pool.query("SELECT * FROM otp_verifications WHERE email = $1 AND otp = $2", [email, otp]);

    if (otpRecord.rows.length === 0) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const { expires_at } = otpRecord.rows[0];

    // Check if OTP is expired
    if (new Date() > new Date(expires_at)) {
      return res.status(400).json({ message: "OTP expired. Request a new one." });
    }

    // Get user details from temporary storage
    const userDetails = pendingUsers.get(email);
    if (!userDetails) {
      return res.status(400).json({ message: "User details not found. Request a new OTP." });
    }

    const { name, mobile_number, city, password } = userDetails;

    // Delete OTP after verification
    await pool.query("DELETE FROM otp_verifications WHERE email = $1", [email]);
    pendingUsers.delete(email);

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into database
    const result = await pool.query(
      `INSERT INTO userquery (name, mobile_number, email, city, password) 
      VALUES ($1, $2, $3, $4, $5) RETURNING id, name, mobile_number, email, city`,
      [name, mobile_number, email, city, hashedPassword]
    );

    res.status(201).json({ message: "Signup successful!", user: result.rows[0] });
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 📌 User Login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

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

    res.json({
      message: "Login successful",
      user: { id: user.rows[0].id, email: user.rows[0].email, name: user.rows[0].name },
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 📌 Get User by Email
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

module.exports = { sendOtpAndCheckEmail, verifyOtpAndSignup, loginUser, getUserByEmail };


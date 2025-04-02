const express = require("express");
const { sendBookingEmail } = require("../controllers/notificationController");


const notificationRouter = express.Router();

// Define the route for booking confirmation
notificationRouter.post("/book", sendBookingEmail);

module.exports = notificationRouter;

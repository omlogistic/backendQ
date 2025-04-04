const express = require("express");
const { BookingDetails, getAllBookings, getBookingById, getBookingsBySalonId, deleteBooking } = require("../controllers/bookingDetailsController");
const bookingRouter = express.Router();


bookingRouter.post("/bookings", BookingDetails);
bookingRouter.get("/bookings", getAllBookings);
bookingRouter.get("/bookings/:id", getBookingById);
bookingRouter.get("/bookings/salon/:salonId", getBookingsBySalonId);
bookingRouter.delete("/bookings/:id", deleteBooking);

module.exports =  bookingRouter;

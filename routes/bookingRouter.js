const express = require("express");
const { BookingDetails, getAllBookings, getBookingById, getBookingsBySalonId, deleteBooking, DoctorBookingDetails } = require("../controllers/bookingDetailsController");
const bookingRouter = express.Router();


bookingRouter.post("/bookings-details", BookingDetails);
bookingRouter.get("/bookings", getAllBookings);
bookingRouter.get("/bookings/:id", getBookingById);
bookingRouter.get("/bookings/salon/:salonId", getBookingsBySalonId);
bookingRouter.delete("/bookings/:id", deleteBooking);

// doctor booking 

bookingRouter.post("/doctor-bookings-details", DoctorBookingDetails);

module.exports =  bookingRouter;

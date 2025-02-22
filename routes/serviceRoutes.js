const express = require("express");
const { addVendorServices, getVendorServicesByEmail } = require("../controllers/serviceController");

const serviceRoute = express.Router();
serviceRoute.post("/addVendorServices", addVendorServices);
serviceRoute.post("/getVendorServicesByEmail", getVendorServicesByEmail);


module.exports =  serviceRoute;

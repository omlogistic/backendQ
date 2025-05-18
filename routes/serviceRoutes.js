const express = require("express");
const { addVendorServices, getVendorServicesByEmail, deleteVendorService, addSubcategory, getSubcategoriesByEmail } = require("../controllers/serviceController");

const serviceRoute = express.Router();
serviceRoute.post("/addVendorServices", addVendorServices);
serviceRoute.post("/getVendorServicesByEmail", getVendorServicesByEmail);
serviceRoute.post("/deleteVendorServices", deleteVendorService);
serviceRoute.post("/addSubcategory", addSubcategory);
serviceRoute.post("/getSubcategoriesByEmail", getSubcategoriesByEmail);


module.exports =  serviceRoute;

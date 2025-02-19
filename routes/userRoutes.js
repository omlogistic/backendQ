const express = require("express");
const { signupUser, loginUser, getUserByEmail } = require("../controllers/userController");
const uresRouter = express.Router();

uresRouter.post("/signup", signupUser);
uresRouter.post("/login", loginUser);
uresRouter.get("/email/:email", getUserByEmail);

module.exports = uresRouter;

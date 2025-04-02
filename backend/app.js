const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

dotenv.config();

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  })
);

app.use(express.json());
app.use(cookieParser());

const chatRoutes = require("./routes/chatRoute");
const authRoutes = require("./routes/authRoute");
const medicalRoutes = require("./routes/medicalRoute");

app.use("/api/auth", authRoutes);
app.use("/api", chatRoutes);
app.use("/api/medical", medicalRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then((res) => {
    console.log("Mongodb connected");
  })
  .catch((err) => {
    console.log("Error connecting Mongodb connection : " + err);
  });

module.exports = app;

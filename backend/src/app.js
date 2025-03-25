const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const { errorHandler } = require("./middleware/errorMiddleware");
const userRoutes = require("./routes/userRoutes");
const limiter = require("./middleware/rateLimiter");
const cloudRoutes = require('./routes/cloudRoutes');

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors());

app.use("/api/users", userRoutes); // ✅ Ensures API routes work
app.use('/api/cloud', cloudRoutes);

app.use(errorHandler);
app.use(limiter);
module.exports = app;

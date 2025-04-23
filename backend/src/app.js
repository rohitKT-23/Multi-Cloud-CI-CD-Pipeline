const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const { errorHandler } = require("./middleware/errorMiddleware");
const userRoutes = require("./routes/userRoutes");
const limiter = require("./middleware/rateLimiter");
const cloudRoutes = require('./routes/cloudRoutes');
const healthRoutes = require('./routes/health');

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors());
app.use(limiter); // Moved limiter before routes to properly protect them

// Routes
app.use("/api/users", userRoutes);
app.use('/api/cloud', cloudRoutes);
app.use('/health', healthRoutes);

// Error handler should be last middleware
app.use(errorHandler);

module.exports = app;
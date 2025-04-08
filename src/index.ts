import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import "dotenv/config";
import mongoose from "mongoose";
import myUserRoute from "./routes/MyUserRoute";
import { v2 as cloudinary } from "cloudinary";
import myRestaurantRoute from "./routes/MyRestaurantRoute";
import restaurantRoute from "./routes/RestaurantRoute";
import orderRoute from "./routes/OrderRoute";

// Database connection with improved error handling
mongoose
  .connect(process.env.MONGODB_CONNECTION_STRING as string)
  .then(() => console.log("Connected to database!"))
  .catch((error) => {
    console.error("Database connection error:", error);
    process.exit(1);
  });

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Webhook endpoint needs raw body
app.use("/api/order/checkout/webhook", express.raw({ type: "*/*" }));

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.send({ message: "health OK!" });
});

// API routes
app.use("/api/my/user", myUserRoute);
app.use("/api/my/restaurant", myRestaurantRoute);
app.use("/api/restaurant", restaurantRoute);
app.use("/api/order", orderRoute);

// 404 handler for undefined routes
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: "Endpoint not found" });
});

// Global error handler (must be last middleware)
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Global error handler:", error);
  res.status(500).json({ 
    message: error.message || "Internal server error" 
  });
});

// Server startup
const PORT = process.env.PORT || 7000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
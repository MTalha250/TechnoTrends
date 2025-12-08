import express, { Request, Response } from "express";
import cors from "cors";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import {
  userRoutes,
  projectRoutes,
  complaintRoutes,
  invoiceRoutes,
  dashboardRoutes,
  maintenanceRoutes,
} from "./routes";
dotenv.config();
const app = express();
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) {
        callback(null, true);
        return;
      }

      // In development, allow all origins
      if (process.env.NODE_ENV === "development") {
        callback(null, true);
        return;
      }

      // In production, allow specific origins
      const allowedOrigins = [
        "http://localhost:3000",
        "http://localhost:3001",
        "https://technotrends.vercel.app",
        // Add your production admin URL here
      ];

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        // Allow all origins in production for now (remove this for stricter security)
        callback(null, true);
      }
    },
  })
);
mongoose.set("strictQuery", false);
if (!process.env.MONGO_URI) {
  throw new Error("MONGO_URI environment variable is not defined");
}
mongoose.connect(process.env.MONGO_URI);

const db = mongoose.connection;

db.once("open", () => {
  console.log("MongoDB connected");
});

db.on("error", (error) => {
  console.log(error);
});

db.on("disconnected", () => {
  console.log("MongoDB disconnected");
});

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/maintenances", maintenanceRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.get("/", (req: Request, res: Response) => {
  res.send("Server is running!");
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});

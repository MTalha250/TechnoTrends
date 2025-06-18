import express from "express";
import {
  createComplaint,
  getComplaints,
  getComplaint,
  updateComplaint,
  deleteComplaint,
  assignUsersToComplaint,
  getComplaintsByStatus,
  getComplaintsByPriority,
  getComplaintsByUser,
} from "../controllers/Complaint";
import { verifyToken, verifyAdmin, verifyHead } from "../middlewares";

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// GET routes
router.get("/", getComplaints); // Get all complaints
router.get("/status/:status", getComplaintsByStatus); // Get complaints by status
router.get("/priority/:priority", getComplaintsByPriority); // Get complaints by priority
router.get("/:id", getComplaint); // Get single complaint
router.get("/user", getComplaintsByUser); // Get complaints by user

// POST routes
router.post("/", verifyHead, createComplaint); // Create complaint (head+ only)
router.post("/:id/assign-users", verifyAdmin, assignUsersToComplaint); // Assign users (admin+ only)

// PUT routes
router.put("/:id", verifyHead, updateComplaint); // Update complaint (head+ only)

// DELETE routes
router.delete("/:id", verifyAdmin, deleteComplaint); // Delete complaint (admin+ only)

export default router;

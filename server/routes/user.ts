import express from "express";
import {
  register,
  login,
  getUser,
  updateUser,
  getPendingUsers,
  changeUserStatus,
  getUsers,
  resetPassword,
  getApprovedUsers,
  deleteUser,
  forgotPassword,
  verifyResetCode,
} from "../controllers/User";
import { verifyDirector, verifyHead, verifyToken } from "../middlewares";

const router = express.Router();
router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-code", verifyResetCode);
router.get("/profile", verifyToken, getUser);
router.get("/", verifyToken, verifyHead, getUsers);
router.put("/profile", verifyToken, updateUser);
router.get("/pending", verifyToken, verifyDirector, getPendingUsers);
router.put("/pending/:id", verifyToken, verifyDirector, changeUserStatus);
router.put("/reset-password", verifyToken, resetPassword);
router.get("/approved", verifyToken, verifyDirector, getApprovedUsers);
router.delete("/:id", verifyToken, verifyDirector, deleteUser);

export default router;

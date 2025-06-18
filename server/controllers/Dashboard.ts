import { Project, Invoice, Complaint } from "../models";
import { Request, Response } from "express";

export const getDashboardData = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const activeProjects = await Project.countDocuments({
      status: { $in: ["In Progress", "Pending"] },
    });
    const activeComplaints = await Complaint.countDocuments({
      status: { $in: ["In Progress", "Pending"] },
    });
    const activeInvoices = await Invoice.countDocuments({
      status: { $in: ["In Progress", "Pending"] },
    });
    const recentProjects = await Project.find({
      status: { $ne: "Cancelled" },
    })
      .populate("createdBy", "name email")
      .populate("users", "name email")
      .sort({ createdAt: -1 })
      .limit(5);
    const recentComplaints = await Complaint.find({
      status: { $ne: "Cancelled" },
    })
      .populate("createdBy", "name email")
      .populate("users", "name email")
      .sort({ createdAt: -1 })
      .limit(5);
    const allProjects = await Project.find({}).select("createdAt");
    const allComplaints = await Complaint.find({}).select("createdAt");

    res.status(200).json({
      activeProjects,
      activeComplaints,
      activeInvoices,
      recentProjects,
      recentComplaints,
      allProjects,
      allComplaints,
    });
  } catch (error) {
    console.log(error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    res.status(500).json({ message: errorMessage });
  }
};

export const getUserDashboardData = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const activeProjects = await Project.countDocuments({
      users: req.userId,
      status: { $in: ["In Progress", "Pending"] },
    });
    const activeComplaints = await Complaint.countDocuments({
      users: req.userId,
      status: { $in: ["In Progress", "Pending"] },
    });
    const recentProjects = await Project.find({
      users: req.userId,
      status: { $ne: "Cancelled" },
    })
      .populate("createdBy", "name email")
      .populate("users", "name email")
      .sort({ createdAt: -1 })
      .limit(5);
    const recentComplaints = await Complaint.find({
      users: req.userId,
      status: { $ne: "Cancelled" },
    })
      .populate("createdBy", "name email")
      .populate("users", "name email")
      .sort({ createdAt: -1 })
      .limit(5);
    const userProjects = await Project.find({ users: req.userId }).select(
      "createdAt"
    );
    const userComplaints = await Complaint.find({ users: req.userId }).select(
      "createdAt"
    );

    res.status(200).json({
      activeProjects,
      activeComplaints,
      recentProjects,
      recentComplaints,
      userProjects,
      userComplaints,
    });
  } catch (error) {
    console.log(error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    res.status(500).json({ message: errorMessage });
  }
};

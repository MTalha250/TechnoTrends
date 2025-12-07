import React from "react";

// ==================== CORE TYPES ====================

export type User = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: "director" | "admin" | "head" | "user";
  department?: "accounts" | "technical" | "it" | "sales" | "store";
  status: "Pending" | "Approved" | "Rejected";
  assignedComplaints?: Complaint[];
  assignedProjects?: Project[];
  createdAt: string;
  updatedAt: string;
};

export type Value = {
  value: string;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Project = {
  _id: string;
  clientName: string;
  description: string;
  po: Value;
  quotation: Value;
  remarks: Value;
  surveyPhotos: string[];
  surveyDate: Date | string | null;
  jcReferences: Value[];
  dcReferences: Value[];
  status: "Pending" | "In Progress" | "Completed" | "Cancelled";
  users: User[];
  dueDate: Date | string | null;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
};

export type Complaint = {
  _id: string;
  complaintReference: string;
  clientName: string;
  description: string;
  po: Value;
  visitDates: (Date | string)[];
  dueDate: Date | string | null;
  createdBy: User;
  users: User[];
  jcReferences: Value[];
  dcReferences: Value[];
  quotation: Value;
  photos: string[];
  priority: "Low" | "Medium" | "High";
  remarks: Value;
  status: "Pending" | "In Progress" | "Completed" | "Cancelled";
  createdAt: string;
  updatedAt: string;
};

export type Invoice = {
  _id: string;
  invoiceReference: string;
  invoiceDate: Date | string | null;
  amount: string;
  paymentTerms: "Cash" | "Credit";
  creditDays?: string;
  dueDate: Date | string | null;
  project: Project;
  status: "Pending" | "In Progress" | "Completed" | "Cancelled";
  createdBy: User;
  createdAt: string;
  updatedAt: string;
};

export type ServiceDate = {
  _id?: string;
  serviceDate: Date | string;
  actualDate: Date | string | null;
  jcReference: string;
  invoiceRef: string;
  paymentStatus: "Pending" | "Paid" | "Overdue" | "Cancelled";
  isCompleted: boolean;
  month: number;
  year: number;
};

export type Maintenance = {
  _id: string;
  clientName: string;
  remarks: Value;
  serviceDates: ServiceDate[];
  users: User[];
  status: "Pending" | "In Progress" | "Completed" | "Cancelled";
  createdBy: User;
  createdAt: string;
  updatedAt: string;
};

// ==================== REQUEST TYPES ====================

export type CreateProjectRequest = {
  clientName: string;
  description: string;
  po?: { value: string; isEdited: boolean };
  quotation?: { value: string; isEdited: boolean };
  remarks?: { value: string; isEdited: boolean };
  surveyDate?: Date | string;
  surveyPhotos?: string[];
  jcReferences?: Array<{ value: string; isEdited: boolean }>;
  dcReferences?: Array<{ value: string; isEdited: boolean }>;
  status?: "Pending" | "In Progress" | "Completed" | "Cancelled";
  users?: string[];
  dueDate?: Date | string;
};

export type CreateComplaintRequest = {
  complaintReference?: string;
  clientName: string;
  description: string;
  po?: { value: string; isEdited: boolean };
  visitDates?: (Date | string)[];
  dueDate?: Date | string;
  users?: string[];
  jcReferences?: Array<{ value: string; isEdited: boolean }>;
  dcReferences?: Array<{ value: string; isEdited: boolean }>;
  quotation?: { value: string; isEdited: boolean };
  photos?: string[];
  priority?: "Low" | "Medium" | "High";
  remarks?: { value: string; isEdited: boolean };
  status?: "Pending" | "In Progress" | "Completed" | "Cancelled";
};

export type CreateInvoiceRequest = {
  invoiceReference?: string;
  invoiceDate?: Date | string;
  amount: string;
  paymentTerms: "Cash" | "Credit";
  creditDays?: string;
  dueDate?: Date | string;
  project: string;
  status?: "Pending" | "In Progress" | "Completed" | "Cancelled";
};

export type CreateMaintenanceRequest = {
  clientName: string;
  remarks?: { value: string; isEdited: boolean };
  serviceDates?: Array<{
    serviceDate: Date | string;
    actualDate?: Date | string | null;
    jcReference?: string;
    invoiceRef?: string;
    paymentStatus?: "Pending" | "Paid" | "Overdue" | "Cancelled";
    isCompleted?: boolean;
    month?: number;
    year?: number;
  }>;
  users?: string[];
  status?: "Pending" | "In Progress" | "Completed" | "Cancelled";
};

export type SignUpRequest = {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  role: "director" | "admin" | "head" | "user";
  department?: "accounts" | "technical" | "it" | "sales" | "store";
};

export type LoginRequest = {
  email: string;
  password: string;
  role: "director" | "admin" | "head" | "user";
};

// ==================== DASHBOARD TYPES ====================

export interface DashboardStats {
  activeProjects: number;
  activeComplaints: number;
  activeInvoices: number;
  activeMaintenances: number;
  recentProjects: Project[];
  recentComplaints: Complaint[];
  recentMaintenances: Maintenance[];
  projects: Project[];
  complaints: Complaint[];
  maintenances: Maintenance[];
}

export interface UserDashboardStats {
  activeProjects: number;
  activeComplaints: number;
  activeMaintenances: number;
  recentProjects: Project[];
  recentComplaints: Complaint[];
  recentMaintenances: Maintenance[];
  projects: Project[];
  complaints: Complaint[];
  maintenances: Maintenance[];
}

// ==================== COMMON TYPES ====================

export interface PaginatedResponse<T> {
  data: T[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

// ==================== API RESPONSE TYPES ====================

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

export interface ApiError {
  message: string;
  status: number;
}

// ==================== COMPONENT PROP TYPES ====================

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  showCloseButton?: boolean;
  isFullscreen?: boolean;
}

export interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export interface TableCellProps {
  children: React.ReactNode;
  className?: string;
  isHeader?: boolean;
  colSpan?: number;
  rowSpan?: number;
}

export interface ComponentCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  desc?: string;
}

export interface BadgeProps {
  children: React.ReactNode;
  variant?: "success" | "error" | "warning" | "info";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export interface ButtonProps {
  children: React.ReactNode;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
}

// ==================== NAVIGATION TYPES ====================

export interface NavItem {
  icon: React.ReactNode;
  name: string;
  path: string;
  roles?: ("director" | "admin" | "head" | "user")[];
  departments?: ("accounts" | "technical" | "it" | "sales" | "store")[];
}

// ==================== FORM INPUT TYPES ====================

export interface SelectOption {
  value: string;
  label: string;
}

export interface MultiSelectOption {
  value: string;
  text: string;
  selected: boolean;
}

// ==================== PHOTO UPLOADER TYPES ====================

export interface PhotosUploaderProps {
  addedPhotos: string[];
  maxPhotos: number;
  onChange: (photos: string[]) => void;
}

// ==================== AUTHENTICATION TYPES ====================

export interface AuthState {
  token: string | null;
  user: User | null;
  role: "director" | "admin" | "head" | "user" | null;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
  role: "director" | "admin" | "head" | "user";
}

export interface LoginResponse {
  message: string;
  user: User;
  token: string;
  role: string;
}

// ==================== FILTER TYPES ====================

export interface ProjectFilters {
  status?: "Pending" | "In Progress" | "Completed" | "Cancelled" | "all";
  search?: string;
}

export interface ComplaintFilters {
  status?: "Pending" | "In Progress" | "Completed" | "Cancelled" | "all";
  priority?: "Low" | "Medium" | "High" | "all";
  search?: string;
}

export interface InvoiceFilters {
  status?: "Pending" | "In Progress" | "Completed" | "Cancelled" | "all";
  paymentTerms?: "Cash" | "Credit" | "all";
  search?: string;
}

export interface MaintenanceFilters {
  status?: "Pending" | "In Progress" | "Completed" | "Cancelled" | "all";
  search?: string;
}

export interface UserFilters {
  status?: "Pending" | "Approved" | "Rejected" | "all";
  role?: "director" | "admin" | "head" | "user" | "all";
  search?: string;
}

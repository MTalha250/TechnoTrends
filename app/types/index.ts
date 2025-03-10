type Admin = {
  id: number;
  name: string;
  email: string;
  phone: string;
  is_director: boolean;
  status: "Pending" | "Approved" | "Rejected";
  created_at: string;
  updated_at: string;
};

type Head = {
  id: number;
  name: string;
  email: string;
  phone: string;
  department: string;
  status: "pending" | "approved" | "rejected";
  assignedComplaints: Complaint[];
  assignedProjects: Project[];
  created_at: string;
  updated_at: string;
};

type User = {
  id: number;
  name: string;
  email: string;
  phone: string;
  head: Head;
  status: "Pending" | "Approved" | "Rejected";
  assignedComplaints: Complaint[];
  assignedProjects: Project[];
  created_at: string;
  updated_at: string;
};

type Project = {
  id: number;
  clientName: string;
  description: string;
  poNumber: string;
  poDate: Date | null;
  surveyPhotos: string[];
  surveyDate: Date | null;
  quotationReference: string;
  quotationDate: Date | null;
  jcReference: string;
  jcDate: Date | null;
  dcReference: string;
  dcDate: Date | null;
  status: "Pending" | "In Progress" | "Completed" | "Cancelled";
  admin: Admin;
  head: Head;
  users: User[];
  remarks: string;
  remarksDate: Date | null;
  dueDate: Date | null;
  created_at: string;
  updated_at: string;
};

type Complaint = {
  id: number;
  complaintReference: string;
  clientName: string;
  description: string;
  poNumber: string;
  poDate: Date | null;
  visitDates: Date[];
  dueDate: Date | null;
  head: Head;
  admin: Admin;
  users: User[];
  jcReference: string;
  jcDate: Date | null;
  dcReference: string;
  dcDate: Date | null;
  quotation: string;
  quotationDate: Date | null;
  photos: string[];
  priority: "Low" | "Medium" | "High";
  remarks: string;
  remarksDate: Date | null;
  status: "Pending" | "In Progress" | "Completed" | "Cancelled";
  created_at: string;
  updated_at: string;
};

type Invoice = {
  id: number;
  clientName: string;
  poNumber: string;
  poDate: Date | null;
  jcReference: string;
  jcDate: Date | null;
  dcReference: string;
  dcDate: Date;
  invoiceReference: string;
  invoiceDate: Date | null;
  amount: string;
  paymentTerms: "Cash" | "Credit";
  creditDays?: string;
  dueDate: Date | null;
  project: Project;
  status: "Pending" | "In Progress" | "Completed" | "Cancelled";
  created_at: string;
  updated_at: string;
};

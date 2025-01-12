type Admin = {
  id: number;
  name: string;
  email: string;
  phone: string;
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
  status: "Pending" | "Approved" | "Rejected";
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
  title: string;
  description: string;
  poNumber: string;
  poImage: string;
  clientName: string;
  clientPhone: string;
  surveyPhotos: string[];
  quotationReference: string;
  quotationImage: string;
  jcReference: string;
  jcImage: string;
  dcReference: string;
  dcImage: string;
  status: "Pending" | "In Progress" | "On Hold" | "Completed";
  assignedBy: Admin;
  assignedHead: Head;
  assignedWorkers: User[];
  remarks: string;
  dueDate: Date | null;
  created_at: string;
  updated_at: string;
};

type Complaint = {
  id: number;
  complaintReference: string;
  complaintImage: string;
  title: string;
  description: string;
  dueDate: Date | null;
  createdBy: Admin;
  assignedHead: Head;
  assignedWorkers: User[];
  jcReference: string;
  jcImage: string;
  photos: string[];
  priority: "Low" | "Medium" | "High";
  remarks: string;
  status: "Pending" | "In Progress" | "Resolved";
  created_at: string;
  updated_at: string;
};

type Invoice = {
  id: number;
  invoiceReference: string;
  invoiceImage: string;
  amount: string;
  paymentTerms: "Cash" | "Credit";
  creditDays?: string;
  dueDate: Date | null;
  linkedProject: Project;
  status: "Paid" | "Unpaid" | "In Progress";
  created_at: string;
  updated_at: string;
};

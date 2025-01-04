type Admin = {
  id: number;
  name: string;
  email: string;
  phone: string;
  approved: boolean;
  created_at: string;
  updated_at: string;
};

type Head = {
  id: number;
  name: string;
  email: string;
  phone: string;
  department: string; // Name of the department
  approved: boolean;
  assignedComplaints: Complaint[]; // Complaints Array
  assignedProjects: Project[]; // Projects Array
  created_at: string;
  updated_at: string;
};

type User = {
  id: number;
  name: string;
  email: string;
  phone: string;
  head: Head; // Head Object
  approved: boolean;
  assignedComplaints: Complaint[]; // Complaints Array
  assignedProjects: Project[]; // Projects Array
  created_at: string;
  updated_at: string;
};

type Project = {
  id: number;
  poNumber: string; // Project Order Number
  clientName: string;
  clientPhone: string;
  surveyPhotos: string[];
  quotationReference: string; // quotation number
  jcReference: string; // job completion number
  dcReference: string; // delivery challan number
  status: "Pending" | "In Progress" | "On Hold" | "Completed";
  assignedBy: Admin; // Admin Object
  assignedHead: Head; // Head Object
  assignedWorkers: User[]; // Users array
  created_at: string;
  updated_at: string;
};

type Complaint = {
  id: number;
  title: string;
  description: string;
  createdBy: Admin; // Admin Object
  assignedHead: Head; // Head Object
  assignedWorkers: User[]; // Users Array
  jcReference: string;
  photos: string[];
  remarks: string;
  status: "Pending" | "In Progress" | "Resolved";
  created_at: string;
  updated_at: string;
};

type Invoice = {
  id: number;
  invoiceReference: string;
  linkedProject: Project; // Project Object
  amount: number;
  paymentTerms: "Cash" | "Credit";
  creditDays?: number;
  dueDate: string;
  status: "Paid" | "Unpaid" | "In Progress";
  created_at: string;
  updated_at: string;
};

type Admin = {
  id: number;
  name: string;
  email: string;
  phone: string;
  isDirector: boolean;
  status: "Pending" | "Approved" | "Rejected";
  created_at: string;
  updated_at: string;
};

type Head = {
  id: number;
  name: string;
  email: string;
  phone: string;
  department: "accounts" | "technical" | "it" | "sales" | "store";
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
  jcReferences: {
    jcReference: string;
    jcDate: Date | null;
    isJcDateEdited: boolean;
  }[];
  dcReferences: {
    dcReference: string;
    dcDate: Date | null;
    isDcDateEdited: boolean;
  }[];
  status: "Pending" | "In Progress" | "Completed" | "Cancelled";
  users: User[];
  remarks: string;
  remarksDate: Date | null;
  dueDate: Date | null;
  createdBy: string;
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
  createdBy: string;
  users: User[];
  jcReferences: {
    jcReference: string;
    jcDate: Date | null;
    isJcDateEdited: boolean;
  }[];
  dcReferences: {
    dcReference: string;
    dcDate: Date | null;
    isDcDateEdited: boolean;
  }[];
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

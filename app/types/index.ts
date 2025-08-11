type User = {
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

type Value = {
  value: string;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
};

type Project = {
  _id: string;
  clientName: string;
  description: string;
  po: Value;
  quotation: Value;
  remarks: Value;
  surveyPhotos: string[];
  surveyDate: Date | null;
  jcReferences: Value[];
  dcReferences: Value[];
  status: "Pending" | "In Progress" | "Completed" | "Cancelled";
  users: User[];
  dueDate: Date | null;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
};

type Complaint = {
  _id: string;
  complaintReference: string;
  clientName: string;
  description: string;
  po: Value;
  visitDates: Date[];
  dueDate: Date | null;
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

type Invoice = {
  _id: string;
  invoiceReference: string;
  invoiceDate: Date | null;
  amount: string;
  paymentTerms: "Cash" | "Credit";
  creditDays?: string;
  dueDate: Date | null;
  project: Project;
  status: "Pending" | "In Progress" | "Completed" | "Cancelled";
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

type ServiceDate = {
  serviceDate: Date;
  actualDate: Date | null;
  jcReference: string;
  invoiceRef: string;
  paymentStatus: "Pending" | "Paid" | "Overdue" | "Cancelled";
  isCompleted: boolean;
  month: number;
  year: number;
};

type Maintenance = {
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

type CreateProjectRequest = {
  clientName: string;
  description: string;
  po?: { value: string; isEdited: boolean };
  quotation?: { value: string; isEdited: boolean };
  remarks?: { value: string; isEdited: boolean };
  surveyDate?: Date;
  surveyPhotos?: string[];
  jcReferences?: Array<{ value: string; isEdited: boolean }>;
  dcReferences?: Array<{ value: string; isEdited: boolean }>;
  status?: "Pending" | "In Progress" | "Completed" | "Cancelled";
  users?: string[];
  dueDate?: Date;
};

type CreateComplaintRequest = {
  complaintReference?: string;
  clientName: string;
  description: string;
  po?: { value: string; isEdited: boolean };
  visitDates?: Date[];
  dueDate?: Date;
  users?: string[];
  jcReferences?: Array<{ value: string; isEdited: boolean }>;
  dcReferences?: Array<{ value: string; isEdited: boolean }>;
  quotation?: { value: string; isEdited: boolean };
  photos?: string[];
  priority?: "Low" | "Medium" | "High";
  remarks?: { value: string; isEdited: boolean };
  status?: "Pending" | "In Progress" | "Completed" | "Cancelled";
};

type CreateInvoiceRequest = {
  invoiceReference: string;
  invoiceDate?: Date;
  amount: string;
  paymentTerms: "Cash" | "Credit";
  creditDays?: string;
  dueDate?: Date;
  project: string;
  status?: "Pending" | "In Progress" | "Completed" | "Cancelled";
};

type CreateMaintenanceRequest = {
  clientName: string;
  remarks?: { value: string; isEdited: boolean };
  serviceDates?: Array<{
    serviceDate: Date;
    actualDate?: Date | null;
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

type SignUpRequest = {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  role: "director" | "admin" | "head" | "user";
  department?: "accounts" | "technical" | "it" | "sales" | "store";
};

type LoginRequest = {
  email: string;
  password: string;
  role: "director" | "admin" | "head" | "user";
};

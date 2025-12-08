"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Loader2, Edit, Trash2, Check, ExternalLink, Receipt, FileText, CreditCard, DollarSign, Clock } from "lucide-react";
import useAuthStore from "@/store/authStore";
import { getInvoice, updateInvoice, deleteInvoice } from "@/hooks/invoices";
import { getProjects } from "@/hooks/projects";
import { Invoice, Project } from "@/types";
import toast from "react-hot-toast";

const getStatusColor = (status: string) => {
  switch (status) {
    case "Completed":
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    case "In Progress":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    case "Cancelled":
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    default:
      return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
  }
};

const getPaymentTermsColor = (terms: string) => {
  return terms === "Cash"
    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
    : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
};

const paymentTermsOptions = [
  { value: "Cash", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  { value: "Credit", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
];

const statusOptions = ["Pending", "In Progress", "Completed", "Cancelled"];

export default function InvoiceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { token, role } = useAuthStore();
  const id = params.id as string;
  const editParam = searchParams.get("edit");

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(editParam === "true");

  const canEdit = role === "director" || role === "admin" || role === "head";
  const canDelete = role === "director" || role === "admin";

  useEffect(() => {
    fetchInvoice();
  }, [id, token]);

  const fetchInvoice = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const [invoiceData, projectsData] = await Promise.all([
        getInvoice(token, id),
        getProjects(token),
      ]);
      setInvoice(invoiceData);
      setProjects(projectsData.filter((p) => p.status !== "Cancelled"));
    } catch (error) {
      console.error("Error fetching invoice:", error);
      toast.error("Failed to fetch invoice");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!invoice || !token) return;
    if (!invoice.amount) {
      toast.error("Amount is required");
      return;
    }

    try {
      setSaving(true);
      await updateInvoice(token, id, {
        invoiceReference: invoice.invoiceReference,
        invoiceDate: invoice.invoiceDate || undefined,
        amount: invoice.amount,
        paymentTerms: invoice.paymentTerms,
        creditDays: invoice.creditDays,
        dueDate: invoice.dueDate || undefined,
        project: invoice.project._id,
        status: invoice.status,
      });
      toast.success("Invoice updated successfully");
      setEditMode(false);
      fetchInvoice();
    } catch (error) {
      console.error("Error updating invoice:", error);
      toast.error("Failed to update invoice");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!token) return;
    if (!confirm("Are you sure you want to cancel this invoice?")) return;

    try {
      setSaving(true);
      await deleteInvoice(token, id);
      toast.success("Invoice cancelled successfully");
      router.push("/invoices");
    } catch (error) {
      console.error("Error deleting invoice:", error);
      toast.error("Failed to cancel invoice");
    } finally {
      setSaving(false);
    }
  };

  const handleFieldChange = (field: string, value: string | Date | null) => {
    setInvoice((prev) => prev ? { ...prev, [field]: value } : prev);
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString();
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(parseFloat(amount) || 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
          <Receipt className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-500 dark:text-gray-400 font-medium mb-4">Invoice not found</p>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl p-6">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-24 -mt-24" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mb-16" />

        <div className="relative flex flex-col sm:flex-row justify-between items-start gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors backdrop-blur-sm"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                <Receipt className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-bold text-white">Invoice #{invoice.invoiceReference}</h1>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getStatusColor(invoice.status)}`}>
                    {invoice.status}
                  </span>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getPaymentTermsColor(invoice.paymentTerms)}`}>
                    {invoice.paymentTerms}{invoice.paymentTerms === "Credit" && invoice.creditDays && ` (${invoice.creditDays} days)`}
                  </span>
                </div>
                <p className="text-purple-100 text-sm mt-0.5 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Created by {invoice.createdBy?.name} on {formatDate(invoice.createdAt)}
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {canEdit && (
              <button
                onClick={() => editMode ? handleSaveChanges() : setEditMode(true)}
                disabled={saving}
                className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all font-semibold shadow-lg ${
                  editMode
                    ? "bg-white text-emerald-600 hover:bg-emerald-50 shadow-emerald-900/20"
                    : "bg-white text-purple-600 hover:bg-purple-50 shadow-purple-900/20"
                } disabled:opacity-50`}
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : editMode ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Edit className="w-4 h-4" />
                )}
                {editMode ? "Save Changes" : "Edit"}
              </button>
            )}
            {canDelete && invoice.status !== "Cancelled" && !editMode && (
              <button
                onClick={handleDelete}
                disabled={saving}
                className="px-4 py-2.5 bg-white/10 hover:bg-red-500 text-white rounded-xl flex items-center gap-2 disabled:opacity-50 transition-colors backdrop-blur-sm"
              >
                <Trash2 className="w-4 h-4" />
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Project Link Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-transparent dark:from-gray-700/30">
          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <FileText className="w-5 h-5 text-purple-500" />
            <span className="font-semibold">Linked Project</span>
          </div>
        </div>
        <div className="p-6">
          {editMode ? (
            <select
              value={invoice.project._id}
              onChange={(e) => {
                const selectedProject = projects.find((p) => p._id === e.target.value);
                if (selectedProject) {
                  setInvoice((prev) => prev ? { ...prev, project: selectedProject } : prev);
                }
              }}
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:bg-white dark:focus:bg-gray-600 transition-all"
            >
              {projects.map((project) => (
                <option key={project._id} value={project._id}>
                  {project.clientName} - {project.description?.slice(0, 50)}...
                </option>
              ))}
            </select>
          ) : (
            <Link
              href={`/projects/${invoice.project._id}`}
              className="inline-flex items-center gap-3 px-4 py-3 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors group"
            >
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold">{invoice.project.clientName}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Click to view project details</p>
              </div>
              <ExternalLink className="w-5 h-5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          )}
        </div>
      </div>

      {/* Invoice Details Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-transparent dark:from-gray-700/30">
          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <DollarSign className="w-5 h-5 text-purple-500" />
            <span className="font-semibold">Invoice Details</span>
          </div>
        </div>
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Amount
              </label>
              {editMode ? (
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    value={invoice.amount}
                    onChange={(e) => handleFieldChange("amount", e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:bg-white dark:focus:bg-gray-600 transition-all"
                  />
                </div>
              ) : (
                <div className="px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gradient-to-r from-purple-50 to-transparent dark:from-purple-900/20 dark:to-transparent">
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{formatCurrency(invoice.amount)}</p>
                </div>
              )}
            </div>

            {/* Invoice Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Invoice Date
              </label>
              {editMode ? (
                <div className="relative">
                  <input
                    type="date"
                    value={invoice.invoiceDate ? new Date(invoice.invoiceDate).toISOString().split("T")[0] : ""}
                    onChange={(e) => handleFieldChange("invoiceDate", e.target.value ? new Date(e.target.value) : null)}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:bg-white dark:focus:bg-gray-600 transition-all"
                  />
                  <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              ) : (
                <p className="px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
                  {formatDate(invoice.invoiceDate)}
                </p>
              )}
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Due Date
            </label>
            {editMode ? (
              <div className="relative">
                <input
                  type="date"
                  value={invoice.dueDate ? new Date(invoice.dueDate).toISOString().split("T")[0] : ""}
                  onChange={(e) => handleFieldChange("dueDate", e.target.value ? new Date(e.target.value) : null)}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:bg-white dark:focus:bg-gray-600 transition-all"
                />
                <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            ) : (
              <p className="px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
                {formatDate(invoice.dueDate)}
              </p>
            )}
          </div>

          {/* Status (edit only) */}
          {editMode && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <div className="flex flex-wrap gap-2">
                {statusOptions.map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => handleFieldChange("status", status)}
                    className={`px-4 py-2 rounded-xl font-medium transition-all border-2 ${
                      invoice.status === status
                        ? `${getStatusColor(status)} border-current`
                        : "bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-transparent hover:bg-gray-100 dark:hover:bg-gray-600"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payment Terms Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-transparent dark:from-gray-700/30">
          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <CreditCard className="w-5 h-5 text-purple-500" />
            <span className="font-semibold">Payment Terms</span>
          </div>
        </div>
        <div className="p-6 space-y-5">
          {/* Payment Terms */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Payment Type
            </label>
            {editMode ? (
              <div className="flex gap-3">
                {paymentTermsOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleFieldChange("paymentTerms", option.value)}
                    className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all border-2 ${
                      invoice.paymentTerms === option.value
                        ? `${option.color} border-current`
                        : "bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-transparent hover:bg-gray-100 dark:hover:bg-gray-600"
                    }`}
                  >
                    {option.value}
                  </button>
                ))}
              </div>
            ) : (
              <p className={`inline-block px-4 py-2 rounded-xl font-medium ${getPaymentTermsColor(invoice.paymentTerms)}`}>
                {invoice.paymentTerms}
              </p>
            )}
          </div>

          {/* Credit Days */}
          {(invoice.paymentTerms === "Credit" || editMode) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Credit Days
              </label>
              {editMode ? (
                <input
                  type="number"
                  value={invoice.creditDays || ""}
                  onChange={(e) => handleFieldChange("creditDays", e.target.value)}
                  placeholder="Enter credit days"
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:bg-white dark:focus:bg-gray-600 transition-all"
                />
              ) : (
                <p className="px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
                  {invoice.creditDays ? `${invoice.creditDays} days` : "-"}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

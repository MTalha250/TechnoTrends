"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, Loader2, Receipt, FileText, CreditCard, DollarSign } from "lucide-react";
import useAuthStore from "@/store/authStore";
import { createInvoice } from "@/hooks/invoices";
import { getProjects } from "@/hooks/projects";
import { CreateInvoiceRequest, Project } from "@/types";
import toast from "react-hot-toast";

const paymentTermsOptions = [
  { value: "Cash", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  { value: "Credit", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
];

export default function CreateInvoicePage() {
  const router = useRouter();
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  const [invoice, setInvoice] = useState<CreateInvoiceRequest>({
    invoiceReference: "",
    invoiceDate: undefined,
    amount: "",
    paymentTerms: "Cash",
    creditDays: "",
    dueDate: undefined,
    project: "",
    status: "Pending",
  });

  useEffect(() => {
    fetchProjects();
  }, [token]);

  const fetchProjects = async () => {
    if (!token) return;
    try {
      setLoadingProjects(true);
      const data = await getProjects(token);
      setProjects(data.filter((p) => p.status !== "Cancelled"));
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast.error("Failed to fetch projects");
    } finally {
      setLoadingProjects(false);
    }
  };

  const handleChange = (field: keyof CreateInvoiceRequest, value: string | Date | undefined) => {
    setInvoice((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!invoice.amount?.trim()) {
      toast.error("Amount is required");
      return;
    }

    if (!invoice.project) {
      toast.error("Please select a project");
      return;
    }

    if (!token) {
      toast.error("Not authenticated");
      return;
    }

    try {
      setLoading(true);
      await createInvoice(token, invoice);
      toast.success("Invoice created successfully");
      router.push("/invoices");
    } catch (error) {
      console.error("Error creating invoice:", error);
      toast.error("Failed to create invoice");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl p-6">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-24 -mt-24" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mb-16" />

        <div className="relative flex items-center gap-4">
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
              <h1 className="text-2xl font-bold text-white">Create Invoice</h1>
              <p className="text-purple-100 text-sm mt-0.5">
                Generate a new invoice for a project
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Project Selection Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-transparent dark:from-gray-700/30">
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <FileText className="w-5 h-5 text-purple-500" />
              <span className="font-semibold">Project Selection</span>
            </div>
          </div>
          <div className="p-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Project <span className="text-red-500">*</span>
            </label>
            {loadingProjects ? (
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading projects...
              </div>
            ) : (
              <select
                value={invoice.project}
                onChange={(e) => handleChange("project", e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:bg-white dark:focus:bg-gray-600 transition-all"
                required
              >
                <option value="">Select a project</option>
                {projects.map((project) => (
                  <option key={project._id} value={project._id}>
                    {project.clientName} - {project.description?.slice(0, 50)}...
                  </option>
                ))}
              </select>
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
            {/* Invoice Reference */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Invoice Reference
              </label>
              <input
                type="text"
                value={invoice.invoiceReference}
                onChange={(e) => handleChange("invoiceReference", e.target.value)}
                placeholder="Enter invoice reference (auto-generated if empty)"
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:bg-white dark:focus:bg-gray-600 transition-all"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Amount <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    value={invoice.amount}
                    onChange={(e) => handleChange("amount", e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:bg-white dark:focus:bg-gray-600 transition-all"
                    required
                  />
                </div>
              </div>

              {/* Invoice Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Invoice Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={invoice.invoiceDate ? new Date(invoice.invoiceDate).toISOString().split("T")[0] : ""}
                    onChange={(e) => handleChange("invoiceDate", e.target.value ? new Date(e.target.value) : undefined)}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:bg-white dark:focus:bg-gray-600 transition-all"
                  />
                  <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Due Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={invoice.dueDate ? new Date(invoice.dueDate).toISOString().split("T")[0] : ""}
                  onChange={(e) => handleChange("dueDate", e.target.value ? new Date(e.target.value) : undefined)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:bg-white dark:focus:bg-gray-600 transition-all"
                />
                <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
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
            {/* Payment Terms Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Payment Type <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-3">
                {paymentTermsOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleChange("paymentTerms", option.value as "Cash" | "Credit")}
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
            </div>

            {/* Credit Days (only shown if Credit is selected) */}
            {invoice.paymentTerms === "Credit" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Credit Days
                </label>
                <input
                  type="number"
                  value={invoice.creditDays}
                  onChange={(e) => handleChange("creditDays", e.target.value)}
                  placeholder="Enter number of credit days (e.g., 30)"
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:bg-white dark:focus:bg-gray-600 transition-all"
                />
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold shadow-lg shadow-purple-500/25"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Creating Invoice...
            </>
          ) : (
            <>
              <Receipt className="w-5 h-5" />
              Create Invoice
            </>
          )}
        </button>
      </form>
    </div>
  );
}

"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Search, Calendar, Receipt, Filter } from "lucide-react";
import useAuthStore from "@/store/authStore";
import { getInvoices } from "@/hooks/invoices";
import { Invoice, Value } from "@/types";
import toast from "react-hot-toast";

const statusOptions = ["All", "Pending", "In Progress", "Completed"];

const formatDate = (date: Date | string | null): string => {
  if (!date) return "No date";
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const hasValue = (value: string | Value | Date | null | undefined): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === "string" && value.trim() === "") return false;
  if (typeof value === "object" && "value" in value && (!value.value || value.value.trim() === "")) return false;
  return true;
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "Completed":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    case "In Progress":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
    case "Pending":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
    default:
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
  }
};

const getCellStyle = (hasData: boolean) => {
  return hasData
    ? "bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400"
    : "bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400";
};

export default function InvoicesPage() {
  const router = useRouter();
  const { token, role } = useAuthStore();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const canCreate = role === "director" || role === "admin" || role === "head";

  useEffect(() => {
    fetchInvoices();
  }, [token]);

  const fetchInvoices = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const data = await getInvoices(token);
      setInvoices(data);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      toast.error("Failed to fetch invoices");
    } finally {
      setLoading(false);
    }
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.invoiceReference?.toLowerCase().includes(search.toLowerCase()) ||
      invoice.project?.clientName?.toLowerCase().includes(search.toLowerCase()) ||
      invoice.project?.po?.value?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl p-6">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-24 -mt-24" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mb-16" />

        <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
              <Receipt className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Invoices</h1>
              <p className="text-purple-100 text-sm mt-0.5">
                {filteredInvoices.length} {filteredInvoices.length === 1 ? "invoice" : "invoices"} found
              </p>
            </div>
          </div>
          {canCreate && (
            <Link
              href="/invoices/create"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-purple-600 rounded-xl hover:bg-purple-50 transition-colors font-semibold shadow-lg shadow-purple-900/20"
            >
              <Plus className="w-5 h-5" />
              New Invoice
            </Link>
          )}
        </div>
      </div>

      {/* Filter and Search Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-transparent dark:from-gray-700/30">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 mb-3">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Filter & Search</span>
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by client, reference or PO number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:bg-white dark:focus:bg-gray-600 transition-all"
            />
          </div>
        </div>
        <div className="p-4 flex gap-2 overflow-x-auto no-scrollbar">
          {statusOptions.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-5 py-2.5 rounded-xl font-medium whitespace-nowrap transition-all duration-200 ${
                statusFilter === status
                  ? "bg-purple-500 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:scale-[1.02]"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <th className="py-3 px-3 text-left font-bold text-gray-800 dark:text-gray-200 text-sm">Client</th>
                <th className="py-3 px-2 text-left font-bold text-gray-800 dark:text-gray-200 text-sm">PO</th>
                <th className="py-3 px-2 text-left font-bold text-gray-800 dark:text-gray-200 text-sm">DC</th>
                <th className="py-3 px-2 text-left font-bold text-gray-800 dark:text-gray-200 text-sm">JC</th>
                <th className="py-3 px-2 text-left font-bold text-gray-800 dark:text-gray-200 text-sm">Invoice</th>
                <th className="py-3 px-3 text-left font-bold text-gray-800 dark:text-gray-200 text-sm">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12">
                    <div className="flex flex-col items-center justify-center">
                      <Search className="w-8 h-8 text-gray-400 mb-2" />
                      <p className="text-gray-500 dark:text-gray-400 font-medium">
                        {search || statusFilter !== "All" ? "No invoices match your filters" : "No invoices found"}
                      </p>
                      <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                        {search || statusFilter !== "All" ? "Try adjusting your search or filters" : "Create a new invoice to get started"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((invoice, index) => (
                  <tr
                    key={invoice._id}
                    onClick={() => router.push(`/invoices/${invoice._id}`)}
                    className={`border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                      index % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-800/50"
                    }`}
                  >
                    {/* Client */}
                    <td className="py-3 px-3">
                      <p className="text-gray-800 dark:text-white font-medium truncate max-w-[140px]">
                        {invoice.project?.clientName || "No Client"}
                      </p>
                      <p className="text-gray-500 dark:text-gray-400 text-xs truncate max-w-[140px]">
                        {invoice.invoiceReference || "No reference"}
                      </p>
                    </td>

                    {/* PO */}
                    <td className="py-3 px-2">
                      <div className={`px-2 py-1.5 rounded-lg border text-xs whitespace-nowrap ${getCellStyle(hasValue(invoice.project?.po?.value))}`}>
                        <p className="font-medium truncate max-w-[80px]">
                          {invoice.project?.po?.value || "None"}
                        </p>
                        <p className="text-gray-500 text-xs">
                          {formatDate(invoice.project?.po?.updatedAt)}
                        </p>
                      </div>
                    </td>

                    {/* DC */}
                    <td className="py-3 px-2">
                      <div className={`px-2 py-1.5 rounded-lg border text-xs whitespace-nowrap ${getCellStyle(hasValue(invoice.project?.dcReferences?.[invoice.project?.dcReferences?.length - 1]?.value))}`}>
                        <p className="font-medium truncate max-w-[80px]">
                          {invoice.project?.dcReferences?.[invoice.project?.dcReferences?.length - 1]?.value || "None"}
                        </p>
                        <p className="text-gray-500 text-xs">
                          {formatDate(invoice.project?.dcReferences?.[invoice.project?.dcReferences?.length - 1]?.updatedAt)}
                        </p>
                      </div>
                    </td>

                    {/* JC */}
                    <td className="py-3 px-2">
                      <div className={`px-2 py-1.5 rounded-lg border text-xs whitespace-nowrap ${getCellStyle(hasValue(invoice.project?.jcReferences?.[invoice.project?.jcReferences?.length - 1]?.value))}`}>
                        <p className="font-medium truncate max-w-[80px]">
                          {invoice.project?.jcReferences?.[invoice.project?.jcReferences?.length - 1]?.value || "None"}
                        </p>
                        <p className="text-gray-500 text-xs">
                          {formatDate(invoice.project?.jcReferences?.[invoice.project?.jcReferences?.length - 1]?.updatedAt)}
                        </p>
                      </div>
                    </td>

                    {/* Invoice */}
                    <td className="py-3 px-2">
                      <div className={`px-2 py-1.5 rounded-lg border text-xs whitespace-nowrap ${getCellStyle(hasValue(invoice.invoiceReference) && hasValue(invoice.invoiceDate))}`}>
                        <p className="font-medium truncate max-w-[80px]">
                          {invoice.invoiceReference || "None"}
                        </p>
                        <p className="text-gray-500 text-xs">
                          {formatDate(invoice.invoiceDate)}
                        </p>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(invoice.status)}`}>
                        {invoice.status}
                      </span>
                      <p className="text-gray-500 dark:text-gray-400 text-xs flex items-center gap-1 mt-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(invoice.dueDate)}
                      </p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

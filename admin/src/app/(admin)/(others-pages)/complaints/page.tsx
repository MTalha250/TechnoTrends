"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Search, Calendar, AlertTriangle, Filter } from "lucide-react";
import useAuthStore from "@/store/authStore";
import { getComplaints } from "@/hooks/complaints";
import { Complaint, Value } from "@/types";
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

const formatVisitDates = (dates: (Date | string)[] | null | undefined): string => {
  if (!dates || dates.length === 0) return "No visits";
  if (dates.length === 1) return formatDate(dates[0]);
  return `${dates.length} visits`;
};

const hasValue = (value: string | Value | null | undefined): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim() !== "";
  if (typeof value === "object" && "value" in value) {
    return !!(value.value && value.value.trim() !== "");
  }
  return false;
};

const hasVisitDates = (dates: (Date | string)[] | null | undefined): boolean => {
  return dates !== null && dates !== undefined && dates.length > 0;
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

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "High":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
    case "Medium":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
    default:
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
  }
};

const getCellStyle = (hasData: boolean) => {
  return hasData
    ? "bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400"
    : "bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400";
};

export default function ComplaintsPage() {
  const router = useRouter();
  const { token, role } = useAuthStore();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const canCreate = role === "director" || role === "admin" || role === "head";

  useEffect(() => {
    fetchComplaints();
  }, [token]);

  const fetchComplaints = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const data = await getComplaints(token);
      setComplaints(data);
    } catch (error) {
      console.error("Error fetching complaints:", error);
      toast.error("Failed to fetch complaints");
    } finally {
      setLoading(false);
    }
  };

  const filteredComplaints = complaints.filter((complaint) => {
    const matchesSearch =
      complaint.clientName.toLowerCase().includes(search.toLowerCase()) ||
      complaint.description.toLowerCase().includes(search.toLowerCase()) ||
      complaint.complaintReference?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || complaint.status === statusFilter;
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
      <div className="relative overflow-hidden bg-gradient-to-br from-amber-500 to-amber-700 rounded-2xl p-6">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-24 -mt-24" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mb-16" />

        <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
              <AlertTriangle className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Complaints</h1>
              <p className="text-amber-100 text-sm mt-0.5">
                {filteredComplaints.length} {filteredComplaints.length === 1 ? "complaint" : "complaints"} found
              </p>
            </div>
          </div>
          {canCreate && (
            <Link
              href="/complaints/create"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-amber-600 rounded-xl hover:bg-amber-50 transition-colors font-semibold shadow-lg shadow-amber-900/20"
            >
              <Plus className="w-5 h-5" />
              New Complaint
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
              placeholder="Search by client, reference or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent focus:bg-white dark:focus:bg-gray-600 transition-all"
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
                  ? "bg-amber-500 text-white"
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
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <th className="py-3 px-3 text-left font-bold text-gray-800 dark:text-gray-200 text-sm">Client</th>
                <th className="py-3 px-2 text-left font-bold text-gray-800 dark:text-gray-200 text-sm">Visit Dates</th>
                <th className="py-3 px-2 text-left font-bold text-gray-800 dark:text-gray-200 text-sm">Quotation</th>
                <th className="py-3 px-2 text-left font-bold text-gray-800 dark:text-gray-200 text-sm">PO</th>
                <th className="py-3 px-2 text-left font-bold text-gray-800 dark:text-gray-200 text-sm">DC</th>
                <th className="py-3 px-2 text-left font-bold text-gray-800 dark:text-gray-200 text-sm">JC</th>
                <th className="py-3 px-2 text-left font-bold text-gray-800 dark:text-gray-200 text-sm">Remarks</th>
                <th className="py-3 px-3 text-left font-bold text-gray-800 dark:text-gray-200 text-sm">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredComplaints.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12">
                    <div className="flex flex-col items-center justify-center">
                      <Search className="w-8 h-8 text-gray-400 mb-2" />
                      <p className="text-gray-500 dark:text-gray-400 font-medium">
                        {search || statusFilter !== "All" ? "No complaints match your filters" : "No complaints found"}
                      </p>
                      <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                        {search || statusFilter !== "All" ? "Try adjusting your search or filters" : "Create a new complaint to get started"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredComplaints.map((complaint, index) => (
                  <tr
                    key={complaint._id}
                    onClick={() => router.push(`/complaints/${complaint._id}`)}
                    className={`border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                      index % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-800/50"
                    }`}
                  >
                    {/* Client */}
                    <td className="py-3 px-3">
                      <p className="text-gray-800 dark:text-white font-medium truncate max-w-[120px]">
                        {complaint.clientName}
                      </p>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs mt-1 ${getPriorityColor(complaint.priority)}`}>
                        {complaint.priority}
                      </span>
                    </td>

                    {/* Visit Dates */}
                    <td className="py-3 px-2">
                      <div className={`px-2 py-1.5 rounded-lg border text-xs whitespace-nowrap ${getCellStyle(hasVisitDates(complaint.visitDates))}`}>
                        <p className="font-medium">
                          {formatVisitDates(complaint.visitDates)}
                        </p>
                      </div>
                    </td>

                    {/* Quotation */}
                    <td className="py-3 px-2">
                      <div className={`px-2 py-1.5 rounded-lg border text-xs whitespace-nowrap ${getCellStyle(hasValue(complaint.quotation?.value))}`}>
                        <p className="font-medium truncate max-w-[80px]">
                          {complaint.quotation?.value || "None"}
                        </p>
                        <p className="text-gray-500 text-xs">
                          {formatDate(complaint.quotation?.updatedAt)}
                        </p>
                      </div>
                    </td>

                    {/* PO */}
                    <td className="py-3 px-2">
                      <div className={`px-2 py-1.5 rounded-lg border text-xs whitespace-nowrap ${getCellStyle(hasValue(complaint.po?.value))}`}>
                        <p className="font-medium truncate max-w-[80px]">
                          {complaint.po?.value || "None"}
                        </p>
                        <p className="text-gray-500 text-xs">
                          {formatDate(complaint.po?.updatedAt)}
                        </p>
                      </div>
                    </td>

                    {/* DC */}
                    <td className="py-3 px-2">
                      <div className={`px-2 py-1.5 rounded-lg border text-xs whitespace-nowrap ${getCellStyle(hasValue(complaint.dcReferences?.[complaint.dcReferences.length - 1]?.value))}`}>
                        <p className="font-medium truncate max-w-[80px]">
                          {complaint.dcReferences?.[complaint.dcReferences.length - 1]?.value || "None"}
                        </p>
                        <p className="text-gray-500 text-xs">
                          {formatDate(complaint.dcReferences?.[complaint.dcReferences.length - 1]?.updatedAt)}
                        </p>
                      </div>
                    </td>

                    {/* JC */}
                    <td className="py-3 px-2">
                      <div className={`px-2 py-1.5 rounded-lg border text-xs whitespace-nowrap ${getCellStyle(hasValue(complaint.jcReferences?.[complaint.jcReferences.length - 1]?.value))}`}>
                        <p className="font-medium truncate max-w-[80px]">
                          {complaint.jcReferences?.[complaint.jcReferences.length - 1]?.value || "None"}
                        </p>
                        <p className="text-gray-500 text-xs">
                          {formatDate(complaint.jcReferences?.[complaint.jcReferences.length - 1]?.updatedAt)}
                        </p>
                      </div>
                    </td>

                    {/* Remarks */}
                    <td className="py-3 px-2">
                      <div className={`px-2 py-1.5 rounded-lg border text-xs whitespace-nowrap ${getCellStyle(hasValue(complaint.remarks?.value))}`}>
                        <p className="font-medium truncate max-w-[100px]">
                          {complaint.remarks?.value || "None"}
                        </p>
                        <p className="text-gray-500 text-xs">
                          {formatDate(complaint.remarks?.updatedAt)}
                        </p>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(complaint.status)}`}>
                        {complaint.status}
                      </span>
                      <p className="text-gray-500 dark:text-gray-400 text-xs flex items-center gap-1 mt-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(complaint.dueDate)}
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

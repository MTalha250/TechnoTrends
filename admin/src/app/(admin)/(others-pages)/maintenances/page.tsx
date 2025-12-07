"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Search, Calendar, Wrench, Filter } from "lucide-react";
import useAuthStore from "@/store/authStore";
import { getMaintenances } from "@/hooks/maintenances";
import { Maintenance, Value, ServiceDate } from "@/types";
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

const formatServiceDates = (serviceDates: ServiceDate[] | undefined): string => {
  if (!serviceDates || serviceDates.length === 0) return "No dates";

  const upcomingDates = serviceDates.filter((sd) => !sd.isCompleted);
  const completedDates = serviceDates.filter((sd) => sd.isCompleted);

  if (upcomingDates.length > 0) {
    return `${upcomingDates.length} upcoming`;
  } else if (completedDates.length > 0) {
    return `${completedDates.length} completed`;
  }

  return `${serviceDates.length} total`;
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

const getPaymentStatusInfo = (serviceDates: ServiceDate[] | undefined) => {
  if (!serviceDates || serviceDates.length === 0) {
    return { text: "No payments", style: "bg-gray-50 border-gray-200 text-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300" };
  }

  const pendingPayments = serviceDates.filter((sd) => sd.paymentStatus === "Pending").length;
  const overduePayments = serviceDates.filter((sd) => sd.paymentStatus === "Overdue").length;
  const paidPayments = serviceDates.filter((sd) => sd.paymentStatus === "Paid").length;

  if (overduePayments > 0) {
    return { text: `${overduePayments} overdue`, style: "bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400" };
  } else if (pendingPayments > 0) {
    return { text: `${pendingPayments} pending`, style: "bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-400" };
  } else if (paidPayments > 0) {
    return { text: `${paidPayments} paid`, style: "bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400" };
  }

  return { text: "No payments", style: "bg-gray-50 border-gray-200 text-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300" };
};

const getNextUpcomingDate = (serviceDates: ServiceDate[] | undefined): Date | null => {
  if (!serviceDates) return null;
  const today = new Date();
  const upcoming = serviceDates
    .filter((sd) => !sd.isCompleted && sd.serviceDate)
    .map((sd) => new Date(sd.serviceDate))
    .filter((d) => !isNaN(d.getTime()) && d >= new Date(today.getFullYear(), today.getMonth(), today.getDate()))
    .sort((a, b) => a.getTime() - b.getTime());
  return upcoming[0] || null;
};

export default function MaintenancesPage() {
  const router = useRouter();
  const { token, role } = useAuthStore();
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const canCreate = role === "director" || role === "admin" || role === "head";

  useEffect(() => {
    fetchMaintenances();
  }, [token]);

  const fetchMaintenances = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const data = await getMaintenances(token);
      setMaintenances(data);
    } catch (error) {
      console.error("Error fetching maintenances:", error);
      toast.error("Failed to fetch maintenances");
    } finally {
      setLoading(false);
    }
  };

  const filteredMaintenances = maintenances.filter((maintenance) => {
    const matchesSearch =
      maintenance.clientName.toLowerCase().includes(search.toLowerCase()) ||
      maintenance.remarks?.value?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || maintenance.status === statusFilter;
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
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl p-6">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-24 -mt-24" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mb-16" />

        <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
              <Wrench className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Maintenances</h1>
              <p className="text-emerald-100 text-sm mt-0.5">
                {filteredMaintenances.length} {filteredMaintenances.length === 1 ? "maintenance" : "maintenances"} found
              </p>
            </div>
          </div>
          {canCreate && (
            <Link
              href="/maintenances/create"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-emerald-600 rounded-xl hover:bg-emerald-50 transition-colors font-semibold shadow-lg shadow-emerald-900/20"
            >
              <Plus className="w-5 h-5" />
              New Maintenance
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
              placeholder="Search by client or remarks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:bg-white dark:focus:bg-gray-600 transition-all"
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
                  ? "bg-emerald-500 text-white"
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
                <th className="py-3 px-2 text-left font-bold text-gray-800 dark:text-gray-200 text-sm">Service Dates</th>
                <th className="py-3 px-2 text-left font-bold text-gray-800 dark:text-gray-200 text-sm">Payment</th>
                <th className="py-3 px-2 text-left font-bold text-gray-800 dark:text-gray-200 text-sm">Remarks</th>
                <th className="py-3 px-3 text-left font-bold text-gray-800 dark:text-gray-200 text-sm">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredMaintenances.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12">
                    <div className="flex flex-col items-center justify-center">
                      <Search className="w-8 h-8 text-gray-400 mb-2" />
                      <p className="text-gray-500 dark:text-gray-400 font-medium">
                        {search || statusFilter !== "All" ? "No maintenances match your filters" : "No maintenances found"}
                      </p>
                      <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                        {search || statusFilter !== "All" ? "Try adjusting your search or filters" : "Create a new maintenance to get started"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredMaintenances.map((maintenance, index) => {
                  const paymentInfo = getPaymentStatusInfo(maintenance.serviceDates);
                  const nextDate = getNextUpcomingDate(maintenance.serviceDates);

                  return (
                    <tr
                      key={maintenance._id}
                      onClick={() => router.push(`/maintenances/${maintenance._id}`)}
                      className={`border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                        index % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-800/50"
                      }`}
                    >
                      {/* Client */}
                      <td className="py-3 px-3">
                        <p className="text-gray-800 dark:text-white font-medium truncate max-w-[140px]">
                          {maintenance.clientName}
                        </p>
                        <p className="text-gray-500 dark:text-gray-400 text-xs truncate max-w-[140px]">
                          by {maintenance.createdBy?.name || "Unknown"}
                        </p>
                      </td>

                      {/* Service Dates */}
                      <td className="py-3 px-2">
                        <div className={`px-2 py-1.5 rounded-lg border text-xs whitespace-nowrap ${getCellStyle((maintenance.serviceDates?.length || 0) > 0)}`}>
                          <p className="font-medium">
                            {formatServiceDates(maintenance.serviceDates)}
                          </p>
                          <p className="text-gray-500 text-xs">
                            {maintenance.serviceDates?.length || 0} total
                          </p>
                        </div>
                      </td>

                      {/* Payment Status */}
                      <td className="py-3 px-2">
                        <div className={`px-2 py-1.5 rounded-lg border text-xs whitespace-nowrap ${paymentInfo.style}`}>
                          <p className="font-medium">
                            {paymentInfo.text}
                          </p>
                        </div>
                      </td>

                      {/* Remarks */}
                      <td className="py-3 px-2">
                        <div className={`px-2 py-1.5 rounded-lg border text-xs whitespace-nowrap ${getCellStyle(hasValue(maintenance.remarks?.value))}`}>
                          <p className="font-medium truncate max-w-[120px]">
                            {maintenance.remarks?.value || "None"}
                          </p>
                          <p className="text-gray-500 text-xs">
                            {formatDate(maintenance.remarks?.updatedAt)}
                          </p>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(maintenance.status)}`}>
                          {maintenance.status}
                        </span>
                        <p className="text-gray-500 dark:text-gray-400 text-xs flex items-center gap-1 mt-1">
                          <Calendar className="w-3 h-3" />
                          {nextDate ? formatDate(nextDate) : "No upcoming"}
                        </p>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

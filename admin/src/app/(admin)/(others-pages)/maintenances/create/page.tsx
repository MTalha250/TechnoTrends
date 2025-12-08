"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, X, Calendar, Loader2, Wrench, FileText, MessageSquare, CalendarDays } from "lucide-react";
import useAuthStore from "@/store/authStore";
import { createMaintenance } from "@/hooks/maintenances";
import { CreateMaintenanceRequest } from "@/types";
import toast from "react-hot-toast";

export default function CreateMaintenancePage() {
  const router = useRouter();
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [serviceDate, setServiceDate] = useState("");

  const [maintenance, setMaintenance] = useState<CreateMaintenanceRequest>({
    clientName: "",
    remarks: { value: "", isEdited: false },
    serviceDates: [],
    status: "Pending",
  });

  const handleChange = (field: keyof CreateMaintenanceRequest, value: string) => {
    setMaintenance((prev) => ({ ...prev, [field]: value }));
  };

  const addServiceDate = () => {
    if (!serviceDate) {
      toast.error("Please select a service date");
      return;
    }
    const date = new Date(serviceDate);
    setMaintenance((prev) => ({
      ...prev,
      serviceDates: [
        ...(prev.serviceDates || []),
        {
          serviceDate: date,
          actualDate: null,
          jcReference: "",
          invoiceRef: "",
          paymentStatus: "Pending",
          isCompleted: false,
          month: date.getMonth() + 1,
          year: date.getFullYear(),
        },
      ],
    }));
    setServiceDate("");
  };

  const removeServiceDate = (index: number) => {
    setMaintenance((prev) => ({
      ...prev,
      serviceDates: prev.serviceDates?.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!maintenance.clientName?.trim()) {
      toast.error("Client name is required");
      return;
    }

    if (!token) {
      toast.error("Not authenticated");
      return;
    }

    try {
      setLoading(true);
      await createMaintenance(token, maintenance);
      toast.success("Maintenance created successfully");
      router.push("/maintenances");
    } catch (error) {
      console.error("Error creating maintenance:", error);
      toast.error("Failed to create maintenance");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getMonthName = (month: number) => {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return months[month - 1];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl p-6">
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
              <Wrench className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Create Maintenance</h1>
              <p className="text-emerald-100 text-sm mt-0.5">
                Add a new maintenance contract
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-transparent dark:from-gray-700/30">
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <FileText className="w-5 h-5 text-emerald-500" />
              <span className="font-semibold">Basic Information</span>
            </div>
          </div>
          <div className="p-6 space-y-5">
            {/* Client Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Client Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={maintenance.clientName}
                onChange={(e) => handleChange("clientName", e.target.value)}
                placeholder="Enter client name"
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:bg-white dark:focus:bg-gray-600 transition-all"
                required
              />
            </div>
          </div>
        </div>

        {/* Remarks Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-transparent dark:from-gray-700/30">
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <MessageSquare className="w-5 h-5 text-emerald-500" />
              <span className="font-semibold">Remarks</span>
            </div>
          </div>
          <div className="p-6">
            <textarea
              value={maintenance.remarks?.value || ""}
              onChange={(e) =>
                setMaintenance((prev) => ({
                  ...prev,
                  remarks: { value: e.target.value, isEdited: false },
                }))
              }
              placeholder="Enter any additional remarks or notes about this maintenance contract..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:bg-white dark:focus:bg-gray-600 transition-all"
            />
          </div>
        </div>

        {/* Service Dates Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-transparent dark:from-gray-700/30">
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <CalendarDays className="w-5 h-5 text-emerald-500" />
              <span className="font-semibold">Service Dates</span>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {/* Add Service Date */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="date"
                  value={serviceDate}
                  onChange={(e) => setServiceDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:bg-white dark:focus:bg-gray-600 transition-all"
                />
                <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
              <button
                type="button"
                onClick={addServiceDate}
                className="px-4 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/25"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {/* Service Dates List */}
            {maintenance.serviceDates && maintenance.serviceDates.length > 0 ? (
              <div className="space-y-3">
                {maintenance.serviceDates.map((sd, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-100 dark:bg-emerald-800/50 rounded-lg">
                        <Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {formatDate(sd.serviceDate)}
                        </p>
                        <p className="text-sm text-emerald-600 dark:text-emerald-400">
                          {sd.month && sd.year ? `${getMonthName(sd.month)} ${sd.year}` : ""}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeServiceDate(index)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <CalendarDays className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                <p className="font-medium">No service dates added</p>
                <p className="text-sm mt-1">Add service dates using the date picker above</p>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold shadow-lg shadow-emerald-500/25"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Creating Maintenance...
            </>
          ) : (
            <>
              <Wrench className="w-5 h-5" />
              Create Maintenance
            </>
          )}
        </button>
      </form>
    </div>
  );
}

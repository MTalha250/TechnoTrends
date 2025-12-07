"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { ArrowLeft, Plus, X, Calendar, Loader2, Edit, Trash2, Check, Users, CheckCircle, Wrench, FileText, MessageSquare, CalendarDays, Clock, CreditCard } from "lucide-react";
import useAuthStore from "@/store/authStore";
import { getMaintenance, updateMaintenance, deleteMaintenance, assignUsersToMaintenance } from "@/hooks/maintenances";
import { getApprovedUsers } from "@/hooks/users";
import { Maintenance, User, ServiceDate } from "@/types";
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

const getPaymentStatusColor = (status: string) => {
  switch (status) {
    case "Paid":
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    case "Overdue":
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    case "Cancelled":
      return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
    default:
      return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
  }
};

const getInitials = (name: string | undefined | null) => {
  if (!name) return "?";
  return name.split(" ").map((word) => word[0]).join("").toUpperCase().slice(0, 2);
};

const getAvatarColor = (name: string | undefined | null) => {
  const colors = ["bg-blue-500", "bg-green-500", "bg-yellow-500", "bg-purple-500", "bg-pink-500", "bg-indigo-500", "bg-red-500", "bg-teal-500"];
  if (!name || name.length === 0) return colors[0];
  const index = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[index % colors.length];
};

export default function MaintenanceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { token, role } = useAuthStore();
  const id = params.id as string;
  const editParam = searchParams.get("edit");

  const [maintenance, setMaintenance] = useState<Maintenance | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(editParam === "true");
  const [serviceDate, setServiceDate] = useState("");
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  const canEdit = role === "director" || role === "admin" || role === "head";
  const canDelete = role === "director" || role === "admin";
  const canAssignUsers = role !== "user";

  useEffect(() => {
    fetchMaintenance();
  }, [id, token]);

  const fetchMaintenance = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const [maintenanceData, usersData] = await Promise.all([
        getMaintenance(token, id),
        getApprovedUsers(token),
      ]);
      setMaintenance(maintenanceData);
      setUsers(usersData);
      setSelectedUserIds(maintenanceData.users?.map((u) => u._id) || []);
    } catch (error) {
      console.error("Error fetching maintenance:", error);
      toast.error("Failed to fetch maintenance");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!maintenance || !token) return;
    if (!maintenance.clientName?.trim()) {
      toast.error("Client name is required");
      return;
    }

    try {
      setSaving(true);
      await updateMaintenance(token, id, {
        clientName: maintenance.clientName,
        remarks: maintenance.remarks,
        serviceDates: maintenance.serviceDates,
        status: maintenance.status,
      });
      toast.success("Maintenance updated successfully");
      setEditMode(false);
      fetchMaintenance();
    } catch (error) {
      console.error("Error updating maintenance:", error);
      toast.error("Failed to update maintenance");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!token) return;
    if (!confirm("Are you sure you want to delete this maintenance?")) return;

    try {
      setSaving(true);
      await deleteMaintenance(token, id);
      toast.success("Maintenance deleted successfully");
      router.push("/maintenances");
    } catch (error) {
      console.error("Error deleting maintenance:", error);
      toast.error("Failed to delete maintenance");
    } finally {
      setSaving(false);
    }
  };

  const handleAssignUsers = async () => {
    if (!token) return;
    try {
      await assignUsersToMaintenance(token, id, selectedUserIds);
      toast.success("Users assigned successfully");
      setShowUserModal(false);
      fetchMaintenance();
    } catch (error) {
      console.error("Error assigning users:", error);
      toast.error("Failed to assign users");
    }
  };

  const handleFieldChange = (field: string, value: string) => {
    setMaintenance((prev) => prev ? { ...prev, [field]: value } : prev);
  };

  const addServiceDate = () => {
    if (!serviceDate) {
      toast.error("Please select a service date");
      return;
    }
    const date = new Date(serviceDate);
    setMaintenance((prev) => prev ? {
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
    } : prev);
    setServiceDate("");
  };

  const removeServiceDate = (index: number) => {
    setMaintenance((prev) => prev ? {
      ...prev,
      serviceDates: prev.serviceDates?.filter((_, i) => i !== index),
    } : prev);
  };

  const updateServiceDate = (index: number, field: keyof ServiceDate, value: string | boolean | Date | null) => {
    setMaintenance((prev) => prev ? {
      ...prev,
      serviceDates: prev.serviceDates?.map((sd, i) =>
        i === index ? { ...sd, [field]: value } : sd
      ),
    } : prev);
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "-";
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!maintenance) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Wrench className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
        <p className="text-gray-500 dark:text-gray-400 mb-4 font-medium">Maintenance not found</p>
        <button
          onClick={() => router.back()}
          className="px-6 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors font-medium"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl p-6">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-24 -mt-24" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mb-16" />

        <div className="relative">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="flex items-center gap-4">
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
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-2xl font-bold text-white">{maintenance.clientName}</h1>
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusColor(maintenance.status)}`}>
                      {maintenance.status}
                    </span>
                  </div>
                  <p className="text-emerald-100 text-sm mt-1">
                    Created by {maintenance.createdBy?.name} on {formatDate(maintenance.createdAt)}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-2 ml-auto sm:ml-0">
              {canEdit && (
                <button
                  onClick={() => editMode ? handleSaveChanges() : setEditMode(true)}
                  disabled={saving}
                  className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all font-medium ${
                    editMode
                      ? "bg-white text-emerald-600 hover:bg-emerald-50"
                      : "bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm"
                  } disabled:opacity-50`}
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : editMode ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Edit className="w-4 h-4" />
                  )}
                  {editMode ? "Save" : "Edit"}
                </button>
              )}
              {canDelete && !editMode && (
                <button
                  onClick={handleDelete}
                  disabled={saving}
                  className="px-4 py-2 bg-red-500/80 hover:bg-red-500 text-white rounded-xl flex items-center gap-2 disabled:opacity-50 transition-colors backdrop-blur-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Basic Information Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-transparent dark:from-gray-700/30">
          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <FileText className="w-5 h-5 text-emerald-500" />
            <span className="font-semibold">Basic Information</span>
          </div>
        </div>
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Client Name
            </label>
            <input
              type="text"
              value={maintenance.clientName || ""}
              onChange={(e) => handleFieldChange("clientName", e.target.value)}
              readOnly={!editMode}
              className={`w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white transition-all ${
                !editMode
                  ? "bg-gray-50 dark:bg-gray-900 cursor-not-allowed"
                  : "bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:bg-white dark:focus:bg-gray-600"
              }`}
            />
          </div>

          {editMode && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <div className="flex gap-2 flex-wrap">
                {["Pending", "In Progress", "Completed", "Cancelled"].map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => handleFieldChange("status", status)}
                    className={`px-4 py-2 rounded-xl font-medium transition-all border-2 ${
                      maintenance.status === status
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
              setMaintenance((prev) =>
                prev
                  ? {
                      ...prev,
                      remarks: {
                        ...prev.remarks,
                        value: e.target.value,
                        isEdited: true,
                        updatedAt: new Date().toISOString(),
                      },
                    }
                  : prev
              )
            }
            readOnly={!editMode}
            rows={4}
            placeholder={editMode ? "Enter any additional remarks or notes..." : "No remarks"}
            className={`w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 transition-all ${
              !editMode
                ? "bg-gray-50 dark:bg-gray-900 cursor-not-allowed"
                : "bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:bg-white dark:focus:bg-gray-600"
            }`}
          />
          {maintenance.remarks?.updatedAt && (
            <p className="text-xs text-gray-400 mt-2">
              Last updated: {formatDate(maintenance.remarks.updatedAt)}
            </p>
          )}
        </div>
      </div>

      {/* Service Dates Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-transparent dark:from-gray-700/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <CalendarDays className="w-5 h-5 text-emerald-500" />
              <span className="font-semibold">Service Dates</span>
              <span className="text-sm text-gray-400 ml-2">
                ({maintenance.serviceDates?.length || 0} scheduled)
              </span>
            </div>
            {editMode && (
              <div className="flex gap-2">
                <div className="relative">
                  <input
                    type="date"
                    value={serviceDate}
                    onChange={(e) => setServiceDate(e.target.value)}
                    className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
                <button
                  type="button"
                  onClick={addServiceDate}
                  className="p-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/25"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="p-6">
          {maintenance.serviceDates && maintenance.serviceDates.length > 0 ? (
            <div className="space-y-4">
              {maintenance.serviceDates.map((sd, index) => (
                <div
                  key={index}
                  className={`rounded-xl border overflow-hidden ${
                    sd.isCompleted
                      ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                      : "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                  }`}
                >
                  {/* Service Date Header */}
                  <div className="p-4 flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${sd.isCompleted ? "bg-green-100 dark:bg-green-800/50" : "bg-emerald-100 dark:bg-emerald-800/50"}`}>
                        <Calendar className={`w-5 h-5 ${sd.isCompleted ? "text-green-600 dark:text-green-400" : "text-emerald-600 dark:text-emerald-400"}`} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {formatDate(sd.serviceDate)}
                        </p>
                        <p className={`text-sm ${sd.isCompleted ? "text-green-600 dark:text-green-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                          {getMonthName(sd.month)} {sd.year}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {sd.isCompleted && (
                        <span className="flex items-center gap-1 text-green-600 dark:text-green-400 text-sm font-medium">
                          <CheckCircle className="w-4 h-4" />
                          Completed
                        </span>
                      )}
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getPaymentStatusColor(sd.paymentStatus)}`}>
                        {sd.paymentStatus}
                      </span>
                      {editMode && (
                        <button
                          type="button"
                          onClick={() => removeServiceDate(index)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Service Date Details */}
                  {editMode ? (
                    <div className="p-4 pt-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                          <Clock className="w-3.5 h-3.5 inline mr-1" />
                          Actual Date
                        </label>
                        <input
                          type="date"
                          value={sd.actualDate ? new Date(sd.actualDate).toISOString().split("T")[0] : ""}
                          onChange={(e) => updateServiceDate(index, "actualDate", e.target.value ? new Date(e.target.value) : null)}
                          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                          JC Reference
                        </label>
                        <input
                          type="text"
                          value={sd.jcReference || ""}
                          onChange={(e) => updateServiceDate(index, "jcReference", e.target.value)}
                          placeholder="Enter JC ref"
                          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                          Invoice Ref
                        </label>
                        <input
                          type="text"
                          value={sd.invoiceRef || ""}
                          onChange={(e) => updateServiceDate(index, "invoiceRef", e.target.value)}
                          placeholder="Enter invoice ref"
                          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                          <CreditCard className="w-3.5 h-3.5 inline mr-1" />
                          Payment Status
                        </label>
                        <select
                          value={sd.paymentStatus}
                          onChange={(e) => updateServiceDate(index, "paymentStatus", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Paid">Paid</option>
                          <option value="Overdue">Overdue</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>
                      <div className="flex items-center gap-3 md:col-span-2 lg:col-span-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={sd.isCompleted}
                            onChange={(e) => updateServiceDate(index, "isCompleted", e.target.checked)}
                            className="w-5 h-5 text-emerald-500 rounded border-gray-300 focus:ring-emerald-500"
                          />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Mark as completed
                          </span>
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div className="px-4 pb-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Actual Date</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatDate(sd.actualDate)}
                        </p>
                      </div>
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">JC Reference</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {sd.jcReference || "-"}
                        </p>
                      </div>
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Invoice Ref</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {sd.invoiceRef || "-"}
                        </p>
                      </div>
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Status</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {sd.isCompleted ? "Completed" : "Pending"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <CalendarDays className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
              <p className="font-medium">No service dates scheduled</p>
              {editMode && (
                <p className="text-sm mt-1">Add service dates using the date picker above</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Assigned Users Card */}
      {canAssignUsers && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-transparent dark:from-gray-700/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Users className="w-5 h-5 text-emerald-500" />
                <span className="font-semibold">Assigned Workers</span>
                <span className="text-sm text-gray-400 ml-2">
                  ({maintenance.users?.length || 0})
                </span>
              </div>
              <button
                onClick={() => {
                  setSelectedUserIds(maintenance.users?.map((u) => u._id) || []);
                  setShowUserModal(true);
                }}
                className="px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 flex items-center gap-2 text-sm font-medium transition-colors shadow-lg shadow-emerald-500/25"
              >
                <Edit className="w-4 h-4" />
                Manage
              </button>
            </div>
          </div>
          <div className="p-6">
            {maintenance.users && maintenance.users.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {maintenance.users.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700"
                  >
                    <div
                      className={`w-12 h-12 rounded-full ${getAvatarColor(user.name)} flex items-center justify-center text-white font-semibold text-lg shadow-lg`}
                    >
                      {getInitials(user.name)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{user.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{user.role || "Worker"}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Users className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                <p className="font-medium">No workers assigned</p>
                <p className="text-sm mt-1">Click "Manage" to assign workers to this maintenance</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* User Assignment Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-emerald-500 to-emerald-600">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Assign Workers</h3>
                  <p className="text-emerald-100 text-sm">{selectedUserIds.length} selected</p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-4 overflow-y-auto max-h-[50vh]">
              <div className="space-y-2">
                {users.map((user) => (
                  <button
                    key={user._id}
                    onClick={() => {
                      if (selectedUserIds.includes(user._id)) {
                        setSelectedUserIds(selectedUserIds.filter((id) => id !== user._id));
                      } else {
                        setSelectedUserIds([...selectedUserIds, user._id]);
                      }
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                      selectedUserIds.includes(user._id)
                        ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30"
                        : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full ${getAvatarColor(user.name)} flex items-center justify-center text-white font-semibold`}
                    >
                      {getInitials(user.name)}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{user.role}</p>
                    </div>
                    {selectedUserIds.includes(user._id) && (
                      <div className="p-1 bg-emerald-500 rounded-full">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex gap-3">
              <button
                onClick={() => {
                  setShowUserModal(false);
                  setSelectedUserIds(maintenance.users?.map((u) => u._id) || []);
                }}
                className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignUsers}
                className="flex-1 px-4 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 font-medium transition-colors shadow-lg shadow-emerald-500/25"
              >
                Update Assignment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

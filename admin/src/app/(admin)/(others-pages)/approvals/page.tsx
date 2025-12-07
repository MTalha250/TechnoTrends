"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Loader2, Users, UserCheck, Trash2, Clock, Mail, Phone, Shield, Search, Filter } from "lucide-react";
import useAuthStore from "@/store/authStore";
import { getPendingUsers, getApprovedUsers, updateUserStatus, deleteUser } from "@/hooks/users";
import { User } from "@/types";
import toast from "react-hot-toast";

const getRoleBadgeColor = (role: string) => {
  switch (role) {
    case "director":
      return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
    case "admin":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    case "head":
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
  }
};

const getDepartmentBadgeColor = (department?: string) => {
  switch (department) {
    case "technical":
      return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
    case "it":
      return "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400";
    case "accounts":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
    case "sales":
      return "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400";
    case "store":
      return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
  }
};

const getAvatarColor = (name: string | undefined | null) => {
  const colors = [
    "bg-red-500", "bg-blue-500", "bg-green-500", "bg-yellow-500",
    "bg-purple-500", "bg-pink-500", "bg-indigo-500", "bg-cyan-500",
  ];
  if (!name || name.length === 0) return colors[0];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

export default function ApprovalsPage() {
  const router = useRouter();
  const { token, role } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"pending" | "approved">("pending");
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [approvedUsers, setApprovedUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const canManage = role === "director" || role === "admin";

  useEffect(() => {
    if (!canManage) {
      router.push("/");
      return;
    }
    fetchUsers();
  }, [token, canManage]);

  const fetchUsers = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const [pending, approved] = await Promise.all([
        getPendingUsers(token),
        getApprovedUsers(token),
      ]);
      setPendingUsers(pending);
      setApprovedUsers(approved);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: string) => {
    if (!token) return;
    try {
      setActionLoading(userId);
      await updateUserStatus(token, userId, "Approved");
      toast.success("User approved successfully");
      fetchUsers();
    } catch (error) {
      console.error("Error approving user:", error);
      toast.error("Failed to approve user");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (userId: string) => {
    if (!token) return;
    if (!confirm("Are you sure you want to reject this user?")) return;
    try {
      setActionLoading(userId);
      await updateUserStatus(token, userId, "Rejected");
      toast.success("User rejected successfully");
      fetchUsers();
    } catch (error) {
      console.error("Error rejecting user:", error);
      toast.error("Failed to reject user");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!token) return;
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    try {
      setActionLoading(userId);
      await deleteUser(token, userId);
      toast.success("User deleted successfully");
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user");
    } finally {
      setActionLoading(null);
    }
  };

  const filteredPendingUsers = pendingUsers.filter((user) =>
    user.name?.toLowerCase().includes(search.toLowerCase()) ||
    user.email?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredApprovedUsers = approvedUsers.filter((user) =>
    user.name?.toLowerCase().includes(search.toLowerCase()) ||
    user.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const UserCard = ({ user, isPending }: { user: User; isPending: boolean }) => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-xl ${getAvatarColor(user.name)} flex items-center justify-center text-white font-bold text-xl shadow-lg`}>
              {user.name ? user.name.charAt(0).toUpperCase() : "?"}
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-lg">{user.name || "Unknown"}</h3>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getRoleBadgeColor(user.role)}`}>
                  {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "User"}
                </span>
                {user.department && (
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getDepartmentBadgeColor(user.department)}`}>
                    {user.department.charAt(0).toUpperCase() + user.department.slice(1)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
            <div className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <Mail className="w-4 h-4" />
            </div>
            <span className="truncate">{user.email}</span>
          </div>
          {user.phone && (
            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
              <div className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <Phone className="w-4 h-4" />
              </div>
              <span>{user.phone}</span>
            </div>
          )}
          {isPending && (
            <div className="flex items-center gap-3 text-sm text-yellow-600 dark:text-yellow-400">
              <div className="p-1.5 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <Clock className="w-4 h-4" />
              </div>
              <span className="font-medium">Pending Approval</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700">
        {isPending ? (
          <div className="flex gap-3">
            <button
              onClick={() => handleApprove(user._id)}
              disabled={actionLoading === user._id}
              className="flex-1 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 font-medium shadow-lg shadow-green-500/25"
            >
              {actionLoading === user._id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Approve
                </>
              )}
            </button>
            <button
              onClick={() => handleReject(user._id)}
              disabled={actionLoading === user._id}
              className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 font-medium shadow-lg shadow-red-500/25"
            >
              <X className="w-4 h-4" />
              Reject
            </button>
          </div>
        ) : (
          <button
            onClick={() => handleDelete(user._id)}
            disabled={actionLoading === user._id}
            className="w-full px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/20 dark:hover:bg-red-900/30 dark:text-red-400 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
          >
            {actionLoading === user._id ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Delete User
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl p-6">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-24 -mt-24" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mb-16" />

        <div className="relative flex items-center gap-4">
          <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">User Approvals</h1>
            <p className="text-indigo-100 text-sm mt-0.5">
              Manage user registrations and access control
            </p>
          </div>
        </div>
      </div>

      {/* Search and Tabs Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {/* Search */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-transparent dark:from-gray-700/30">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 mb-3">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Search Users</span>
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white dark:focus:bg-gray-600 transition-all"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="p-4 flex gap-2">
          <button
            onClick={() => setActiveTab("pending")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium whitespace-nowrap transition-all duration-200 ${
              activeTab === "pending"
                ? "bg-indigo-500 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:scale-[1.02]"
            }`}
          >
            <Users className="w-5 h-5" />
            <span>Pending</span>
            {pendingUsers.length > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                activeTab === "pending"
                  ? "bg-white/20 text-white"
                  : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
              }`}>
                {pendingUsers.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("approved")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium whitespace-nowrap transition-all duration-200 ${
              activeTab === "approved"
                ? "bg-indigo-500 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:scale-[1.02]"
            }`}
          >
            <UserCheck className="w-5 h-5" />
            <span>Approved</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              activeTab === "approved"
                ? "bg-white/20 text-white"
                : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
            }`}>
              {approvedUsers.length}
            </span>
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === "pending" ? (
        filteredPendingUsers.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              {search ? "No Results Found" : "No Pending Approvals"}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {search
                ? "Try adjusting your search terms."
                : "All user registrations have been processed."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPendingUsers.map((user) => (
              <UserCard key={user._id} user={user} isPending={true} />
            ))}
          </div>
        )
      ) : filteredApprovedUsers.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserCheck className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            {search ? "No Results Found" : "No Approved Users"}
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {search
              ? "Try adjusting your search terms."
              : "There are no approved users yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredApprovedUsers.map((user) => (
            <UserCard key={user._id} user={user} isPending={false} />
          ))}
        </div>
      )}
    </div>
  );
}

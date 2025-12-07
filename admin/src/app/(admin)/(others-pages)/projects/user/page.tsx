"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Calendar, Image as ImageIcon, FolderOpen, Filter } from "lucide-react";
import useAuthStore from "@/store/authStore";
import { getUserProjects } from "@/hooks/projects";
import { Project, Value } from "@/types";
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

export default function UserProjectsPage() {
  const router = useRouter();
  const { token } = useAuthStore();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    fetchProjects();
  }, [token]);

  const fetchProjects = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const data = await getUserProjects(token);
      setProjects(data);
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast.error("Failed to fetch projects");
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.clientName.toLowerCase().includes(search.toLowerCase()) ||
      project.description.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || project.status === statusFilter;
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
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-6">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-24 -mt-24" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mb-16" />

        <div className="relative flex items-center gap-4">
          <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
            <FolderOpen className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">My Projects</h1>
            <p className="text-blue-100 text-sm mt-0.5">
              {filteredProjects.length} assigned {filteredProjects.length === 1 ? "project" : "projects"}
            </p>
          </div>
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
              placeholder="Search by client or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white dark:focus:bg-gray-600 transition-all"
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
                  ? "bg-blue-500 text-white"
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
                <th className="py-3 px-2 text-left font-bold text-gray-800 dark:text-gray-200 text-sm">Survey</th>
                <th className="py-3 px-2 text-left font-bold text-gray-800 dark:text-gray-200 text-sm">Quotation</th>
                <th className="py-3 px-2 text-left font-bold text-gray-800 dark:text-gray-200 text-sm">PO</th>
                <th className="py-3 px-2 text-left font-bold text-gray-800 dark:text-gray-200 text-sm">DC</th>
                <th className="py-3 px-2 text-left font-bold text-gray-800 dark:text-gray-200 text-sm">JC</th>
                <th className="py-3 px-2 text-left font-bold text-gray-800 dark:text-gray-200 text-sm">Remarks</th>
                <th className="py-3 px-3 text-left font-bold text-gray-800 dark:text-gray-200 text-sm">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12">
                    <div className="flex flex-col items-center justify-center">
                      <Search className="w-8 h-8 text-gray-400 mb-2" />
                      <p className="text-gray-500 dark:text-gray-400 font-medium">
                        {search || statusFilter !== "All" ? "No projects match your filters" : "No assigned projects"}
                      </p>
                      <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                        {search || statusFilter !== "All" ? "Try adjusting your search or filters" : "You have not been assigned to any projects yet"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProjects.map((project, index) => (
                  <tr
                    key={project._id}
                    onClick={() => router.push(`/projects/${project._id}`)}
                    className={`border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                      index % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-800/50"
                    }`}
                  >
                    {/* Client */}
                    <td className="py-3 px-3">
                      <p className="text-gray-800 dark:text-white font-medium truncate max-w-[120px]">
                        {project.clientName}
                      </p>
                      <p className="text-gray-500 dark:text-gray-400 text-xs truncate max-w-[120px]">
                        {project.description || "No description"}
                      </p>
                    </td>

                    {/* Survey */}
                    <td className="py-3 px-2">
                      <div className={`px-2 py-1.5 rounded-lg border text-xs whitespace-nowrap ${getCellStyle(hasValue(project.surveyDate))}`}>
                        <p className="font-medium">
                          {formatDate(project.surveyDate)}
                        </p>
                        <p className="text-gray-500 text-xs flex items-center gap-1">
                          <ImageIcon className="w-3 h-3" />
                          {project.surveyPhotos?.length || 0}
                        </p>
                      </div>
                    </td>

                    {/* Quotation */}
                    <td className="py-3 px-2">
                      <div className={`px-2 py-1.5 rounded-lg border text-xs whitespace-nowrap ${getCellStyle(hasValue(project.quotation?.value))}`}>
                        <p className="font-medium truncate max-w-[80px]">
                          {project.quotation?.value || "None"}
                        </p>
                        <p className="text-gray-500 text-xs">
                          {formatDate(project.quotation?.updatedAt)}
                        </p>
                      </div>
                    </td>

                    {/* PO */}
                    <td className="py-3 px-2">
                      <div className={`px-2 py-1.5 rounded-lg border text-xs whitespace-nowrap ${getCellStyle(hasValue(project.po?.value))}`}>
                        <p className="font-medium truncate max-w-[80px]">
                          {project.po?.value || "None"}
                        </p>
                        <p className="text-gray-500 text-xs">
                          {formatDate(project.po?.updatedAt)}
                        </p>
                      </div>
                    </td>

                    {/* DC */}
                    <td className="py-3 px-2">
                      <div className={`px-2 py-1.5 rounded-lg border text-xs whitespace-nowrap ${getCellStyle(hasValue(project.dcReferences?.[project.dcReferences.length - 1]?.value))}`}>
                        <p className="font-medium truncate max-w-[80px]">
                          {project.dcReferences?.[project.dcReferences.length - 1]?.value || "None"}
                        </p>
                        <p className="text-gray-500 text-xs">
                          {formatDate(project.dcReferences?.[project.dcReferences.length - 1]?.updatedAt)}
                        </p>
                      </div>
                    </td>

                    {/* JC */}
                    <td className="py-3 px-2">
                      <div className={`px-2 py-1.5 rounded-lg border text-xs whitespace-nowrap ${getCellStyle(hasValue(project.jcReferences?.[project.jcReferences.length - 1]?.value))}`}>
                        <p className="font-medium truncate max-w-[80px]">
                          {project.jcReferences?.[project.jcReferences.length - 1]?.value || "None"}
                        </p>
                        <p className="text-gray-500 text-xs">
                          {formatDate(project.jcReferences?.[project.jcReferences.length - 1]?.updatedAt)}
                        </p>
                      </div>
                    </td>

                    {/* Remarks */}
                    <td className="py-3 px-2">
                      <div className={`px-2 py-1.5 rounded-lg border text-xs whitespace-nowrap ${getCellStyle(hasValue(project.remarks?.value))}`}>
                        <p className="font-medium truncate max-w-[100px]">
                          {project.remarks?.value || "None"}
                        </p>
                        <p className="text-gray-500 text-xs">
                          {formatDate(project.remarks?.updatedAt)}
                        </p>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                      <p className="text-gray-500 dark:text-gray-400 text-xs flex items-center gap-1 mt-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(project.dueDate)}
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

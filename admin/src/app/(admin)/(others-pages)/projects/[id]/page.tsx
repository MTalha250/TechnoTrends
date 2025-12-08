"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Plus, X, Calendar, Loader2, Edit, Trash2, Check, Users, FolderOpen, FileText, Hash, MessageSquare, Image as ImageIcon, Clock } from "lucide-react";
import useAuthStore from "@/store/authStore";
import { getProject, updateProject, deleteProject, assignUsersToProject } from "@/hooks/projects";
import { getApprovedUsers } from "@/hooks/users";
import { Project, User, CreateProjectRequest } from "@/types";
import PhotosUploader from "@/components/photosUploader";
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

const getInitials = (name: string | undefined | null) => {
  if (!name) return "?";
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const getAvatarColor = (name: string | undefined | null) => {
  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-red-500",
    "bg-teal-500",
  ];
  if (!name || name.length === 0) return colors[0];
  const index = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[index % colors.length];
};

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { token, role } = useAuthStore();
  const id = params.id as string;
  const editParam = searchParams.get("edit");

  const [project, setProject] = useState<Project | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(editParam === "true");
  const [jcReference, setJcReference] = useState("");
  const [dcReference, setDcReference] = useState("");
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const canEdit = role === "director" || role === "admin" || role === "head";
  const canDelete = role === "director" || role === "admin";
  const canAssignUsers = role !== "user";

  useEffect(() => {
    fetchProject();
  }, [id, token]);

  const fetchProject = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const [projectData, usersData] = await Promise.all([
        getProject(token, id),
        getApprovedUsers(token),
      ]);
      setProject(projectData);
      setUsers(usersData);
      setSelectedUserIds(projectData.users?.map((u) => u._id) || []);
    } catch (error) {
      console.error("Error fetching project:", error);
      toast.error("Failed to fetch project");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!project || !token) return;
    if (!project.clientName?.trim()) {
      toast.error("Client name is required");
      return;
    }

    try {
      setSaving(true);
      await updateProject(token, id, {
        clientName: project.clientName,
        description: project.description,
        po: project.po,
        quotation: project.quotation,
        jcReferences: project.jcReferences,
        dcReferences: project.dcReferences,
        remarks: project.remarks,
        dueDate: project.dueDate || undefined,
        surveyPhotos: project.surveyPhotos,
      });
      toast.success("Project updated successfully");
      setEditMode(false);
      fetchProject();
    } catch (error) {
      console.error("Error updating project:", error);
      toast.error("Failed to update project");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!token) return;
    if (!confirm("Are you sure you want to cancel this project?")) return;

    try {
      setSaving(true);
      await deleteProject(token, id);
      toast.success("Project cancelled successfully");
      router.push("/projects");
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Failed to cancel project");
    } finally {
      setSaving(false);
    }
  };

  const handleAssignUsers = async () => {
    if (!token) return;
    try {
      await assignUsersToProject(token, id, selectedUserIds);
      toast.success("Users assigned successfully");
      setShowUserModal(false);
      fetchProject();
    } catch (error) {
      console.error("Error assigning users:", error);
      toast.error("Failed to assign users");
    }
  };

  const handleFieldChange = (field: string, value: string | Date | null) => {
    setProject((prev) => prev ? { ...prev, [field]: value } : prev);
  };

  const handleValueChange = (field: "quotation" | "po" | "remarks", value: string) => {
    setProject((prev) => prev ? {
      ...prev,
      [field]: { ...prev[field], value, isEdited: true, updatedAt: new Date().toISOString() },
    } : prev);
  };

  const addJcReference = () => {
    if (!jcReference.trim()) {
      toast.error("Please enter a JC reference");
      return;
    }
    setProject((prev) => prev ? {
      ...prev,
      jcReferences: [...(prev.jcReferences || []), { value: jcReference, isEdited: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }],
    } : prev);
    setJcReference("");
  };

  const removeJcReference = (index: number) => {
    setProject((prev) => prev ? {
      ...prev,
      jcReferences: prev.jcReferences?.filter((_, i) => i !== index),
    } : prev);
  };

  const addDcReference = () => {
    if (!dcReference.trim()) {
      toast.error("Please enter a DC reference");
      return;
    }
    setProject((prev) => prev ? {
      ...prev,
      dcReferences: [...(prev.dcReferences || []), { value: dcReference, isEdited: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }],
    } : prev);
    setDcReference("");
  };

  const removeDcReference = (index: number) => {
    setProject((prev) => prev ? {
      ...prev,
      dcReferences: prev.dcReferences?.filter((_, i) => i !== index),
    } : prev);
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <p className="text-gray-500 dark:text-gray-400 mb-4">Project not found</p>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-6">
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
                <FolderOpen className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-white">{project.clientName}</h1>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                </div>
                <p className="text-blue-100 text-sm mt-0.5 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Created by {project.createdBy?.name} on {formatDate(project.createdAt)}
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
                    : "bg-white text-blue-600 hover:bg-blue-50 shadow-blue-900/20"
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
            {canDelete && project.status !== "Cancelled" && !editMode && (
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

      {/* Basic Information Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-transparent dark:from-gray-700/30">
          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <FileText className="w-5 h-5 text-blue-500" />
            <span className="font-semibold">Basic Information</span>
          </div>
        </div>
        <div className="p-6 space-y-5">
          {/* Client Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Client Name
            </label>
            <input
              type="text"
              value={project.clientName || ""}
              onChange={(e) => handleFieldChange("clientName", e.target.value)}
              readOnly={!editMode}
              className={`w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white transition-all ${
                !editMode ? "bg-gray-50 dark:bg-gray-900" : "bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white dark:focus:bg-gray-600"
              }`}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={project.description || ""}
              onChange={(e) => handleFieldChange("description", e.target.value)}
              readOnly={!editMode}
              rows={3}
              className={`w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white transition-all ${
                !editMode ? "bg-gray-50 dark:bg-gray-900" : "bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white dark:focus:bg-gray-600"
              }`}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* PO Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                PO Number
              </label>
              <input
                type="text"
                value={project.po?.value || ""}
                onChange={(e) => handleValueChange("po", e.target.value)}
                readOnly={!editMode}
                placeholder={editMode ? "Enter PO number" : "-"}
                className={`w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white transition-all ${
                  !editMode ? "bg-gray-50 dark:bg-gray-900" : "bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white dark:focus:bg-gray-600"
                }`}
              />
            </div>

            {/* Quotation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Quotation
              </label>
              <input
                type="text"
                value={project.quotation?.value || ""}
                onChange={(e) => handleValueChange("quotation", e.target.value)}
                readOnly={!editMode}
                placeholder={editMode ? "Enter quotation" : "-"}
                className={`w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white transition-all ${
                  !editMode ? "bg-gray-50 dark:bg-gray-900" : "bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white dark:focus:bg-gray-600"
                }`}
              />
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
                  value={project.dueDate ? new Date(project.dueDate).toISOString().split("T")[0] : ""}
                  onChange={(e) => handleFieldChange("dueDate", e.target.value ? new Date(e.target.value) : null)}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white dark:focus:bg-gray-600 transition-all"
                />
                <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            ) : (
              <p className="px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
                {formatDate(project.dueDate)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* References Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-transparent dark:from-gray-700/30">
          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <Hash className="w-5 h-5 text-blue-500" />
            <span className="font-semibold">References</span>
          </div>
        </div>
        <div className="p-6 space-y-5">
          {/* JC References */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              JC References
            </label>
            {editMode && (
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={jcReference}
                  onChange={(e) => setJcReference(e.target.value)}
                  placeholder="Enter JC reference"
                  className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white dark:focus:bg-gray-600 transition-all"
                />
                <button
                  type="button"
                  onClick={addJcReference}
                  className="px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/25"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {project.jcReferences?.map((jc, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-medium"
                >
                  {jc.value}
                  {jc.updatedAt && (
                    <span className="text-xs text-blue-400">({formatDate(jc.updatedAt)})</span>
                  )}
                  {editMode && (
                    <button
                      type="button"
                      onClick={() => removeJcReference(index)}
                      className="text-blue-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </span>
              ))}
              {(!project.jcReferences || project.jcReferences.length === 0) && !editMode && (
                <span className="text-gray-400 dark:text-gray-500 italic">No JC references added</span>
              )}
            </div>
          </div>

          {/* DC References */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              DC References
            </label>
            {editMode && (
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={dcReference}
                  onChange={(e) => setDcReference(e.target.value)}
                  placeholder="Enter DC reference"
                  className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white dark:focus:bg-gray-600 transition-all"
                />
                <button
                  type="button"
                  onClick={addDcReference}
                  className="px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/25"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {project.dcReferences?.map((dc, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-lg text-sm font-medium"
                >
                  {dc.value}
                  {dc.updatedAt && (
                    <span className="text-xs text-emerald-400">({formatDate(dc.updatedAt)})</span>
                  )}
                  {editMode && (
                    <button
                      type="button"
                      onClick={() => removeDcReference(index)}
                      className="text-emerald-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </span>
              ))}
              {(!project.dcReferences || project.dcReferences.length === 0) && !editMode && (
                <span className="text-gray-400 dark:text-gray-500 italic">No DC references added</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Remarks Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-transparent dark:from-gray-700/30">
          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <MessageSquare className="w-5 h-5 text-blue-500" />
            <span className="font-semibold">Remarks</span>
          </div>
        </div>
        <div className="p-6">
          <textarea
            value={project.remarks?.value || ""}
            onChange={(e) => handleValueChange("remarks", e.target.value)}
            readOnly={!editMode}
            rows={4}
            placeholder={editMode ? "Enter any additional remarks or notes..." : ""}
            className={`w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white transition-all ${
              !editMode ? "bg-gray-50 dark:bg-gray-900" : "bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white dark:focus:bg-gray-600"
            }`}
          />
          {!editMode && !project.remarks?.value && (
            <p className="text-gray-400 dark:text-gray-500 italic mt-2">No remarks added</p>
          )}
        </div>
      </div>

      {/* Assigned Users Card */}
      {canAssignUsers && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-transparent dark:from-gray-700/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Users className="w-5 h-5 text-blue-500" />
                <span className="font-semibold">Assigned Workers</span>
                {project.users && project.users.length > 0 && (
                  <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
                    {project.users.length}
                  </span>
                )}
              </div>
              <button
                onClick={() => {
                  setSelectedUserIds(project.users?.map((u) => u._id) || []);
                  setShowUserModal(true);
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 flex items-center gap-2 text-sm font-medium transition-colors shadow-lg shadow-blue-500/25"
              >
                <Edit className="w-4 h-4" />
                Manage
              </button>
            </div>
          </div>
          <div className="p-6">
            {project.users && project.users.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {project.users.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center gap-3 p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800 rounded-xl border border-gray-100 dark:border-gray-700"
                  >
                    <div className={`w-12 h-12 rounded-xl ${getAvatarColor(user.name)} flex items-center justify-center text-white font-bold shadow-lg`}>
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
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium">No workers assigned</p>
                <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Click "Manage" to assign workers to this project</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Survey Photos Card */}
      {(editMode || (project.surveyPhotos && project.surveyPhotos.length > 0)) && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-transparent dark:from-gray-700/30">
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <ImageIcon className="w-5 h-5 text-blue-500" />
              <span className="font-semibold">Survey Photos</span>
              {project.surveyPhotos && project.surveyPhotos.length > 0 && (
                <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
                  {project.surveyPhotos.length}
                </span>
              )}
              {editMode && (
                <span className="text-sm text-gray-400 ml-2">(Max 5)</span>
              )}
            </div>
          </div>
          <div className="p-6">
            {editMode ? (
              <PhotosUploader
                addedPhotos={project.surveyPhotos || []}
                onChange={(photos) => setProject((prev) => prev ? { ...prev, surveyPhotos: photos } : prev)}
                maxPhotos={5}
              />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {project.surveyPhotos?.map((photo, index) => (
                  <div
                    key={index}
                    className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group border-2 border-transparent hover:border-blue-500 transition-all shadow-md hover:shadow-xl"
                    onClick={() => setSelectedImage(photo)}
                  >
                    <Image src={photo} alt={`Survey photo ${index + 1}`} fill className="object-cover transition-transform group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                          <ImageIcon className="w-5 h-5 text-gray-700" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* User Assignment Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-blue-500 to-blue-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/10 rounded-xl">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Assign Workers</h3>
                    <p className="text-blue-100 text-sm">{selectedUserIds.length} selected</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowUserModal(false);
                    setSelectedUserIds(project.users?.map((u) => u._id) || []);
                  }}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-4 max-h-[50vh] overflow-y-auto">
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
                    className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                      selectedUserIds.includes(user._id)
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                        : "border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    }`}
                  >
                    <div className={`w-11 h-11 rounded-xl ${getAvatarColor(user.name)} flex items-center justify-center text-white font-bold shadow-lg`}>
                      {getInitials(user.name)}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-gray-900 dark:text-white">{user.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{user.role}</p>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      selectedUserIds.includes(user._id)
                        ? "border-blue-500 bg-blue-500"
                        : "border-gray-300 dark:border-gray-600"
                    }`}>
                      {selectedUserIds.includes(user._id) && (
                        <Check className="w-4 h-4 text-white" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex gap-3">
              <button
                onClick={() => {
                  setShowUserModal(false);
                  setSelectedUserIds(project.users?.map((u) => u._id) || []);
                }}
                className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignUsers}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 font-semibold transition-all shadow-lg shadow-blue-500/25"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Viewer Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-50"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors backdrop-blur-sm"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="relative">
            <Image
              src={selectedImage}
              alt="Survey photo"
              width={800}
              height={600}
              className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg shadow-2xl"
            />
          </div>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl text-white text-sm">
            Click anywhere to close
          </div>
        </div>
      )}
    </div>
  );
}

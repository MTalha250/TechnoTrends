"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, X, Calendar, Loader2, FolderOpen, FileText, Hash, MessageSquare, Image as ImageIcon } from "lucide-react";
import useAuthStore from "@/store/authStore";
import { createProject } from "@/hooks/projects";
import { CreateProjectRequest } from "@/types";
import PhotosUploader from "@/components/photosUploader";
import toast from "react-hot-toast";

export default function CreateProjectPage() {
  const router = useRouter();
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [jcReference, setJcReference] = useState("");
  const [dcReference, setDcReference] = useState("");

  const [project, setProject] = useState<CreateProjectRequest>({
    clientName: "",
    description: "",
    surveyPhotos: [],
    quotation: { value: "", isEdited: false },
    po: { value: "", isEdited: false },
    jcReferences: [],
    dcReferences: [],
    remarks: { value: "", isEdited: false },
    dueDate: undefined,
  });

  const handleChange = (field: keyof CreateProjectRequest, value: string | Date | undefined) => {
    setProject((prev) => ({ ...prev, [field]: value }));
  };

  const handleValueChange = (field: "quotation" | "po" | "remarks", value: string) => {
    setProject((prev) => ({
      ...prev,
      [field]: { value, isEdited: false },
    }));
  };

  const addJcReference = () => {
    if (!jcReference.trim()) {
      toast.error("Please enter a JC reference");
      return;
    }
    setProject((prev) => ({
      ...prev,
      jcReferences: [...(prev.jcReferences || []), { value: jcReference, isEdited: false }],
    }));
    setJcReference("");
  };

  const removeJcReference = (index: number) => {
    setProject((prev) => ({
      ...prev,
      jcReferences: prev.jcReferences?.filter((_, i) => i !== index),
    }));
  };

  const addDcReference = () => {
    if (!dcReference.trim()) {
      toast.error("Please enter a DC reference");
      return;
    }
    setProject((prev) => ({
      ...prev,
      dcReferences: [...(prev.dcReferences || []), { value: dcReference, isEdited: false }],
    }));
    setDcReference("");
  };

  const removeDcReference = (index: number) => {
    setProject((prev) => ({
      ...prev,
      dcReferences: prev.dcReferences?.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!project.clientName?.trim()) {
      toast.error("Client name is required");
      return;
    }

    if (!token) {
      toast.error("Not authenticated");
      return;
    }

    try {
      setLoading(true);
      await createProject(token, project);
      toast.success("Project created successfully");
      router.push("/projects");
    } catch (error) {
      console.error("Error creating project:", error);
      toast.error("Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-6">
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
              <FolderOpen className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Create Project</h1>
              <p className="text-blue-100 text-sm mt-0.5">
                Add a new project to your list
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
              <FileText className="w-5 h-5 text-blue-500" />
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
                value={project.clientName}
                onChange={(e) => handleChange("clientName", e.target.value)}
                placeholder="Enter client name"
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white dark:focus:bg-gray-600 transition-all"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={project.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Enter project description"
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white dark:focus:bg-gray-600 transition-all"
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
                  placeholder="Enter PO number"
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white dark:focus:bg-gray-600 transition-all"
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
                  placeholder="Enter quotation reference"
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white dark:focus:bg-gray-600 transition-all"
                />
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
                  value={project.dueDate ? new Date(project.dueDate).toISOString().split("T")[0] : ""}
                  onChange={(e) => handleChange("dueDate", e.target.value ? new Date(e.target.value) : undefined)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white dark:focus:bg-gray-600 transition-all"
                />
                <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
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
              <div className="flex gap-2">
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
              {project.jcReferences && project.jcReferences.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {project.jcReferences.map((jc, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-medium"
                    >
                      {jc.value}
                      <button
                        type="button"
                        onClick={() => removeJcReference(index)}
                        className="text-blue-400 hover:text-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* DC References */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                DC References
              </label>
              <div className="flex gap-2">
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
              {project.dcReferences && project.dcReferences.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {project.dcReferences.map((dc, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-lg text-sm font-medium"
                    >
                      {dc.value}
                      <button
                        type="button"
                        onClick={() => removeDcReference(index)}
                        className="text-emerald-400 hover:text-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
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
              placeholder="Enter any additional remarks or notes..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white dark:focus:bg-gray-600 transition-all"
            />
          </div>
        </div>

        {/* Survey Photos Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-transparent dark:from-gray-700/30">
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <ImageIcon className="w-5 h-5 text-blue-500" />
              <span className="font-semibold">Survey Photos</span>
              <span className="text-sm text-gray-400 ml-2">(Max 5)</span>
            </div>
          </div>
          <div className="p-6">
            <PhotosUploader
              addedPhotos={project.surveyPhotos || []}
              onChange={(photos) => setProject((prev) => ({ ...prev, surveyPhotos: photos }))}
              maxPhotos={5}
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold shadow-lg shadow-blue-500/25"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Creating Project...
            </>
          ) : (
            <>
              <FolderOpen className="w-5 h-5" />
              Create Project
            </>
          )}
        </button>
      </form>
    </div>
  );
}

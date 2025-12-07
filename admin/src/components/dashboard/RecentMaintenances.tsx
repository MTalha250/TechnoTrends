"use client";
import React from "react";
import Link from "next/link";
import { ArrowRight, Wrench, ChevronRight, Calendar } from "lucide-react";
import { Maintenance } from "@/types";

interface RecentMaintenancesProps {
  maintenances: Partial<Maintenance>[];
  viewAllLink: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "Completed":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
    case "In Progress":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    case "Cancelled":
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    default:
      return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
  }
};

const RecentMaintenances: React.FC<RecentMaintenancesProps> = ({ maintenances, viewAllLink }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gradient-to-r from-emerald-50 to-transparent dark:from-emerald-900/10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
            <Wrench className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">
            Recent Maintenances
          </h3>
        </div>
        <Link
          href={viewAllLink}
          className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 text-sm font-medium transition-colors"
        >
          View All
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {maintenances.length === 0 ? (
          <div className="p-8 text-center">
            <Wrench className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">No recent maintenances</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Maintenances will appear here</p>
          </div>
        ) : (
          maintenances.map((maintenance) => (
            <Link
              key={maintenance._id}
              href={`/maintenances/${maintenance._id}`}
              className="block p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
            >
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-800 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {maintenance.clientName}
                  </h4>
                  <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{maintenance.serviceDates?.length || 0} service dates</span>
                  </div>
                  {maintenance.remarks?.value && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1 mt-1">
                      {maintenance.remarks.value}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getStatusColor(maintenance.status || "Pending")}`}>
                    {maintenance.status}
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-500 transition-colors" />
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default RecentMaintenances;

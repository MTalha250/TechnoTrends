"use client";
import React from "react";
import { FolderOpen, AlertCircle, Wrench, Receipt, TrendingUp } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number;
  icon: "folder" | "alert" | "wrench" | "receipt";
}

const iconConfig = {
  folder: {
    component: FolderOpen,
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
    iconColor: "text-blue-500",
    accentColor: "from-blue-500/10 to-transparent",
  },
  alert: {
    component: AlertCircle,
    bgColor: "bg-amber-50 dark:bg-amber-900/20",
    iconColor: "text-amber-500",
    accentColor: "from-amber-500/10 to-transparent",
  },
  wrench: {
    component: Wrench,
    bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
    iconColor: "text-emerald-500",
    accentColor: "from-emerald-500/10 to-transparent",
  },
  receipt: {
    component: Receipt,
    bgColor: "bg-purple-50 dark:bg-purple-900/20",
    iconColor: "text-purple-500",
    accentColor: "from-purple-500/10 to-transparent",
  },
};

const StatCard: React.FC<StatCardProps> = ({ title, value, icon }) => {
  const config = iconConfig[icon];
  const IconComponent = config.component;

  return (
    <div className="relative overflow-hidden bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow duration-300">
      {/* Gradient accent */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${config.accentColor} rounded-full -mr-16 -mt-16`} />

      <div className="relative flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
          <div className="flex items-center gap-1 mt-2">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-xs font-medium text-emerald-500">Active</span>
          </div>
        </div>
        <div className={`p-3 rounded-xl ${config.bgColor}`}>
          <IconComponent className={`w-6 h-6 ${config.iconColor}`} />
        </div>
      </div>
    </div>
  );
};

export default StatCard;

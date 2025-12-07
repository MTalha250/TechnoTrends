"use client";
import React, { useMemo } from "react";
import dynamic from "next/dynamic";
import { BarChart3, TrendingUp } from "lucide-react";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface DataPoint {
  createdAt: string;
}

interface ActivityChartProps {
  projects: DataPoint[];
  complaints: DataPoint[];
  maintenances: DataPoint[];
}

const getYear = (date: string) => new Date(date).getFullYear();
const getMonth = (date: string) => new Date(date).getMonth();

const ActivityChart: React.FC<ActivityChartProps> = ({
  projects,
  complaints,
  maintenances,
}) => {
  const chartData = useMemo(() => {
    const groupByMonth = (data: DataPoint[]) => {
      const counts: Record<string, number> = {};
      data.forEach((item) => {
        const year = getYear(item.createdAt);
        const month = getMonth(item.createdAt);
        const key = `${year}-${String(month + 1).padStart(2, "0")}`;
        counts[key] = (counts[key] || 0) + 1;
      });
      return counts;
    };

    const projectCounts = groupByMonth(projects);
    const complaintCounts = groupByMonth(complaints);
    const maintenanceCounts = groupByMonth(maintenances);

    const allKeys = new Set([
      ...Object.keys(projectCounts),
      ...Object.keys(complaintCounts),
      ...Object.keys(maintenanceCounts),
    ]);

    const sortedKeys = Array.from(allKeys).sort();
    const last12Months = sortedKeys.slice(-12);

    const categories = last12Months.map((key) => {
      const [year, month] = key.split("-");
      return new Date(+year, +month - 1).toLocaleString("default", {
        month: "short",
        year: "2-digit",
      });
    });

    return {
      categories,
      series: [
        {
          name: "Projects",
          data: last12Months.map((key) => projectCounts[key] || 0),
        },
        {
          name: "Complaints",
          data: last12Months.map((key) => complaintCounts[key] || 0),
        },
        {
          name: "Maintenances",
          data: last12Months.map((key) => maintenanceCounts[key] || 0),
        },
      ],
    };
  }, [projects, complaints, maintenances]);

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: "line",
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
      fontFamily: "inherit",
    },
    colors: ["#3B82F6", "#EF4444", "#10B981"], // blue-500, red-500, emerald-500
    stroke: {
      curve: "smooth",
      width: 3,
    },
    markers: {
      size: 5,
      strokeWidth: 2,
      strokeColors: "#fff",
      hover: {
        size: 7,
      },
    },
    xaxis: {
      categories: chartData.categories,
      labels: {
        style: {
          colors: "#6B7280",
          fontSize: "12px",
        },
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: "#6B7280",
          fontSize: "12px",
        },
      },
    },
    legend: {
      show: false, // Using custom legend pills instead
    },
    grid: {
      borderColor: "#E5E7EB",
      strokeDashArray: 4,
      padding: {
        left: 10,
        right: 10,
      },
    },
    tooltip: {
      theme: "light",
      y: {
        formatter: (value: number) => `${value} items`,
      },
    },
  };

  const totalItems = projects.length + complaints.length + maintenances.length;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-gradient-to-r from-purple-50 to-transparent dark:from-purple-900/10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white">
              Activity Overview
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Last 12 months performance
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-3 py-1.5 rounded-lg">
          <TrendingUp className="w-4 h-4" />
          <span className="font-medium">{totalItems} total items</span>
        </div>
      </div>

      {/* Legend Pills */}
      <div className="px-5 pt-4 flex flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-blue-500"></span>
          <span className="text-sm text-gray-600 dark:text-gray-400">Projects ({projects.length})</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500"></span>
          <span className="text-sm text-gray-600 dark:text-gray-400">Complaints ({complaints.length})</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
          <span className="text-sm text-gray-600 dark:text-gray-400">Maintenances ({maintenances.length})</span>
        </div>
      </div>

      {/* Chart */}
      <div className="p-5 pt-2">
        <ReactApexChart
          options={options}
          series={chartData.series}
          type="line"
          height={300}
        />
      </div>
    </div>
  );
};

export default ActivityChart;

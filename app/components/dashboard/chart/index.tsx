import React, { useState, useMemo } from "react";
import { View, Text, Dimensions } from "react-native";
import Svg, { Path, Circle, Line, Text as SvgText } from "react-native-svg";

interface DataPoint {
  createdAt: string;
}

interface ChartProps {
  projects: DataPoint[];
  complaints: DataPoint[];
  maintenances?: DataPoint[];
}

// Utility function to get year from date
const getYear = (date: string) => new Date(date).getFullYear();
const getMonth = (date: string) => new Date(date).getMonth(); // 0-based (Jan = 0)

const ActivityChart: React.FC<ChartProps> = ({
  projects,
  complaints,
  maintenances = [],
}) => {
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );

  // Get all available years from the data
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    projects
      .concat(complaints)
      .concat(maintenances)
      .forEach((item) => {
        years.add(getYear(item.createdAt));
      });
    return Array.from(years).sort((a, b) => a - b);
  }, [projects, complaints, maintenances]);

  // Group data by year and month
  const groupByYearAndMonth = (
    data: DataPoint[],
    type: "projects" | "complaints" | "maintenances"
  ) => {
    return data.reduce(
      (
        acc: Record<
          string,
          { projects: number; complaints: number; maintenances: number }
        >,
        item
      ) => {
        const year = getYear(item.createdAt);
        const month = getMonth(item.createdAt);
        const key = `${year}-${month}`;

        if (!acc[key]) {
          acc[key] = { projects: 0, complaints: 0, maintenances: 0 };
        }
        acc[key][type] += 1;

        return acc;
      },
      {}
    );
  };

  // Processed data for the selected year
  const processedData = useMemo(() => {
    const groupedProjects = groupByYearAndMonth(projects, "projects");
    const groupedComplaints = groupByYearAndMonth(complaints, "complaints");
    const groupedMaintenances = groupByYearAndMonth(
      maintenances,
      "maintenances"
    );
    const combinedData: Record<
      string,
      {
        projects: number;
        complaints: number;
        maintenances: number;
        monthLabel: string;
      }
    > = {};

    // Get all unique keys from all data sources
    const allKeys = new Set([
      ...Object.keys(groupedProjects),
      ...Object.keys(groupedComplaints),
      ...Object.keys(groupedMaintenances),
    ]);

    // Combine projects, complaints, and maintenances for each month-year
    allKeys.forEach((key) => {
      const [year, month] = key.split("-");
      const monthLabel = new Date(+year, +month).toLocaleString("default", {
        month: "long",
      });

      combinedData[key] = {
        projects: groupedProjects[key]?.projects || 0,
        complaints: groupedComplaints[key]?.complaints || 0,
        maintenances: groupedMaintenances[key]?.maintenances || 0,
        monthLabel,
      };
    });

    return Object.values(combinedData);
  }, [projects, complaints, maintenances, selectedYear]);

  // Chart dimensions
  const screenWidth = Dimensions.get("window").width;
  const chartWidth = screenWidth - 48; // Padding
  const chartHeight = 200;
  const paddingHorizontal = 40;
  const paddingVertical = 20;

  // Calculate scales
  const maxValue = Math.max(
    ...processedData.map((d) =>
      Math.max(d.projects, d.complaints, d.maintenances)
    )
  );

  // Helper functions for positioning
  const getX = (index: number) =>
    paddingHorizontal +
    (index * (chartWidth - 2 * paddingHorizontal)) /
      Math.max(processedData.length - 1, 1);
  const getY = (value: number) =>
    chartHeight -
    paddingVertical -
    (value / maxValue) * (chartHeight - 2 * paddingVertical);

  // Create smooth path
  const createPath = (values: number[]): string => {
    if (values.length === 0) return "";
    if (values.length === 1) {
      const x = getX(0);
      const y = getY(values[0]);
      return `M ${x},${y} L ${x},${y}`;
    }

    return values.reduce((path, value, index) => {
      const x = getX(index);
      const y = getY(value);

      if (index === 0) return `M ${x},${y}`;

      const prevX = getX(index - 1);
      const prevY = getY(values[index - 1]);
      const cp1x = prevX + (x - prevX) / 2;

      return `${path} C ${cp1x},${prevY} ${cp1x},${y} ${x},${y}`;
    }, "");
  };

  return (
    <View className="p-6 bg-white rounded-lg">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-xl font-bold text-gray-800">
          Activity Overview
        </Text>
        <View>
          {/* <Dropdown
            data={availableYears.map((year) => ({
              label: `${year}`,
              value: year,
            }))}
            value={{ label: `${selectedYear}`, value: selectedYear }}
            onChange={(item) => setSelectedYear(item.value)}
            labelField="label"
            valueField="value"
          /> */}
        </View>
      </View>

      {/* Chart */}
      <Svg width={chartWidth} height={chartHeight}>
        {/* Grid lines */}
        {Array.from({ length: 5 }).map((_, i) => {
          const y =
            paddingVertical + (i * (chartHeight - 2 * paddingVertical)) / 4;
          return (
            <Line
              key={`grid-${i}`}
              x1={paddingHorizontal}
              y1={y}
              x2={chartWidth - paddingHorizontal}
              y2={y}
              stroke="#E5E5E5"
              strokeWidth="1"
            />
          );
        })}

        {/* Axis labels */}
        {processedData.map((item, i) => (
          <SvgText
            key={`label-${i}`}
            x={getX(i)}
            y={chartHeight - 5}
            fontSize="10"
            fill="#666666"
            textAnchor="middle"
          >
            {item.monthLabel}
          </SvgText>
        ))}

        {/* Y-axis labels */}
        {Array.from({ length: 5 }).map((_, i) => (
          <SvgText
            key={`y-label-${i}`}
            x={paddingHorizontal - 5}
            y={paddingVertical + (i * (chartHeight - 2 * paddingVertical)) / 4}
            fontSize="10"
            fill="#666666"
            textAnchor="end"
          >
            {Math.round(maxValue - (i * maxValue) / 4)}
          </SvgText>
        ))}

        {/* Lines */}
        <Path
          d={createPath(processedData.map((d) => d.projects))}
          stroke="#2196F3"
          strokeWidth="2"
          fill="none"
        />
        <Path
          d={createPath(processedData.map((d) => d.complaints))}
          stroke="#F44336"
          strokeWidth="2"
          fill="none"
        />
        <Path
          d={createPath(processedData.map((d) => d.maintenances))}
          stroke="#4CAF50"
          strokeWidth="2"
          fill="none"
        />

        {/* Data points */}
        {processedData.map((item, i) => (
          <React.Fragment key={`points-${i}`}>
            <Circle
              cx={getX(i)}
              cy={getY(item.projects)}
              r="4"
              fill="#2196F3"
            />
            <Circle
              cx={getX(i)}
              cy={getY(item.complaints)}
              r="4"
              fill="#F44336"
            />
            <Circle
              cx={getX(i)}
              cy={getY(item.maintenances)}
              r="4"
              fill="#4CAF50"
            />
          </React.Fragment>
        ))}
      </Svg>

      {/* Legend */}
      <View className="flex-row justify-center gap-6 mt-4">
        <View className="flex-row items-center">
          <View
            style={{
              backgroundColor: "#2196F3",
              width: 10,
              height: 10,
              borderRadius: 50,
              marginRight: 4,
            }}
          />
          <Text className="text-gray-600">Projects</Text>
        </View>
        <View className="flex-row items-center">
          <View
            style={{
              backgroundColor: "#F44336",
              width: 10,
              height: 10,
              borderRadius: 50,
              marginRight: 4,
            }}
          />
          <Text className="text-gray-600">Complaints</Text>
        </View>
        <View className="flex-row items-center">
          <View
            style={{
              backgroundColor: "#4CAF50",
              width: 10,
              height: 10,
              borderRadius: 50,
              marginRight: 4,
            }}
          />
          <Text className="text-gray-600">Maintenances</Text>
        </View>
      </View>
    </View>
  );
};

export default ActivityChart;

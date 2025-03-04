import React, { useMemo } from "react";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Data } from "@/shared/types/data";

const CHART_COLORS = [
  "#8884d8", // Purple
  "#82ca9d", // Green
  "#ffc658", // Yellow
  "#ff8042", // Orange
  "#0088FE", // Blue
  "#FF5733", // Red
];

interface BarChartProps {
  id: number;
  data: Data[];
}

export const BarChart: React.FC<BarChartProps> = ({ id, data }) => {
  // Process data for chart
  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      return [];
    }

    // For bar chart, let's limit to the most recent 10 x values
    // to avoid an overcrowded chart
    const recentXValues = new Set<string>();
    data.forEach((series) => {
      // Sort values by x (assuming x could be a date string or categorical value)
      const sortedValues = [...series.values]
        .sort((a, b) => b.x.localeCompare(a.x))
        .slice(0, 10); // Get 10 most recent/highest

      sortedValues.forEach((point) => {
        recentXValues.add(point.x);
      });
    });

    // Sort x values (could be dates or categories)
    const sortedXValues = Array.from(recentXValues).sort();

    return sortedXValues.map((x) => {
      const dataPoint: Record<string, any> = { x };

      data.forEach((series) => {
        const point = series.values.find((p) => p.x === x);
        dataPoint[series.label] = point ? point.y : null;
      });

      return dataPoint;
    });
  }, [data]);

  // Format y-axis ticks for better readability
  const formatYAxis = (value: number) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k`;
    }
    return value;
  };

  // If no data, show a message
  if (!data || data.length === 0 || chartData.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          background: "#f9f9f9",
          color: "#666",
        }}
      >
        No data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsBarChart
        data={chartData}
        margin={{ top: 5, right: 20, left: 20, bottom: 25 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="x"
          label={{ value: "Category", position: "insideBottom", offset: -10 }}
        />
        <YAxis
          tickFormatter={formatYAxis}
          label={{ value: "Value", angle: -90, position: "insideLeft" }}
        />
        <Tooltip />
        <Legend />
        {data.map((series, index) => (
          <Bar
            key={`${series.label}-${index}`}
            dataKey={series.label}
            fill={CHART_COLORS[index % CHART_COLORS.length]}
          />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  );
};

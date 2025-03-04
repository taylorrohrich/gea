import React, { useMemo } from "react";
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Data } from "@/shared/types/data";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
];

interface PieChartProps {
  id: number;
  data: Data[];
}

export const PieChart: React.FC<PieChartProps> = ({ id, data }) => {
  // For pie chart, we'll use the sum of values for each series
  const pieData = useMemo(() => {
    if (!data || data.length === 0) {
      return [];
    }

    return data.map((series) => {
      // Sum all values in the series
      const totalValue = series.values.reduce((sum, point) => sum + point.y, 0);

      return {
        name: series.label,
        value: totalValue,
      };
    });
  }, [data]);

  // If no data, show a message
  if (!data || data.length === 0 || pieData.length === 0) {
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
      <RechartsPieChart>
        <Pie
          data={pieData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) =>
            `${name}: ${(percent * 100).toFixed(0)}%`
          }
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {pieData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => value.toFixed(2)} />
        <Legend />
      </RechartsPieChart>
    </ResponsiveContainer>
  );
};

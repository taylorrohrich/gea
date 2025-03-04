import React, { useMemo } from "react";
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Data } from "@/shared/types/data";

// These are some colors that work well together for a chart
const CHART_COLORS = [
  "#8884d8", // Purple
  "#82ca9d", // Green
  "#ffc658", // Yellow
  "#ff8042", // Orange
  "#0088FE", // Blue
  "#FF5733", // Red
];

interface LineChartProps {
  id: number;
  data: Data[];
}

export const LineChart: React.FC<LineChartProps> = ({ id, data }) => {
  // Process data for the chart - this merges the data by x-axis value for all series
  const chartData = useMemo(() => {
    // If no data, return empty array
    if (!data || data.length === 0) {
      return [];
    }

    console.log(data);
    // Get all x values from all data series
    const allXValues = new Set<string>();
    data.forEach((series) => {
      series.values.forEach((point) => {
        allXValues.add(point.x);
      });
    });

    // Sort x values
    const sortedXValues = Array.from(allXValues).sort();

    // Create a data point for each x value with values for each series
    return sortedXValues.map((x) => {
      const dataPoint: Record<string, any> = { x };

      // Add each series' value for this x
      data.forEach((series) => {
        const point = series.values.find((p) => p.x === x);
        dataPoint[series.label] = point ? point.y : null;
      });

      return dataPoint;
    });
  }, [data]);

  // Format large numbers for better readability
  const formatYAxis = (value: number) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k`;
    }
    return value;
  };

  // Custom tooltip to show the exact values
  const renderTooltip = (props: any) => {
    const { active, payload, label } = props;

    if (active && payload && payload.length) {
      return (
        <div
          style={{
            background: "white",
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        >
          <p style={{ fontWeight: "bold" }}>{`X: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color, margin: "5px 0" }}>
              {`${entry.name}: ${entry.value?.toFixed(2) || "No data"}`}
            </p>
          ))}
        </div>
      );
    }

    return null;
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
      <RechartsLineChart
        data={chartData}
        margin={{ top: 5, right: 20, left: 20, bottom: 25 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="x"
          label={{ value: "X Axis", position: "insideBottom", offset: -10 }}
        />
        <YAxis
          tickFormatter={formatYAxis}
          label={{ value: "Value", angle: -90, position: "insideLeft" }}
        />
        <Tooltip content={renderTooltip} />
        <Legend />
        {data.map((series, index) => (
          <Line
            key={`${series.label}-${index}`}
            type="monotone"
            dataKey={series.label}
            stroke={CHART_COLORS[index % CHART_COLORS.length]}
            activeDot={{ r: 8 }}
            connectNulls
          />
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
  );
};

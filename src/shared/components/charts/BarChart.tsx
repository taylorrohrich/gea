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
  // Process data for chart - show all data points
  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      return [];
    }

    // Get all x values from all data series
    const allXValues = new Set<string>();
    data.forEach((series) => {
      series.values.forEach((point) => {
        allXValues.add(point.x);
      });
    });

    // Sort x values (could be dates or categories)
    const sortedXValues = Array.from(allXValues).sort();

    // Use all data points without filtering
    return sortedXValues.map((x) => {
      const dataPoint: Record<string, any> = { x };

      data.forEach((series) => {
        const point = series.values.find((p) => p.x === x);
        dataPoint[series.label] = point ? point.y : 0; // Use 0 instead of null for proper stacking
      });

      return dataPoint;
    });
  }, [data]);

  // Format y-axis ticks for better readability
  const formatYAxis = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k`;
    }
    return value;
  };

  // Format x-axis labels to be more readable
  const formatXAxis = (value: string) => {
    // If the x value is a year, return as is
    if (/^\d{4}$/.test(value)) {
      return value;
    }

    // If it's a longer string or date, truncate or format
    if (value.length > 10) {
      return value.substring(0, 10) + "...";
    }

    return value;
  };

  // Enhanced tooltip to show total and individual values
  const renderTooltip = (props: any) => {
    if (!props.active || !props.payload) {
      return null;
    }

    // Calculate total value for this x point
    const total = props.payload.reduce(
      (sum: number, entry: any) => sum + (entry.value || 0),
      0
    );

    return (
      <div
        style={{
          backgroundColor: "#fff",
          border: "1px solid #ccc",
          padding: "10px",
          borderRadius: "4px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <p
          style={{ margin: "0 0 5px", fontWeight: "bold" }}
        >{`${props.label}`}</p>
        {props.payload.map((entry: any, index: number) => (
          <p key={index} style={{ margin: "3px 0", color: entry.color }}>
            {`${entry.name}: ${entry.value?.toFixed(2) || 0}`}
          </p>
        ))}
        <div
          style={{
            height: "1px",
            background: "#ccc",
            margin: "5px 0",
            width: "100%",
          }}
        />
        <p style={{ margin: "5px 0 0", fontWeight: "bold" }}>
          {`Total: ${total.toFixed(2)}`}
        </p>
      </div>
    );
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

  // // Adjust interval for x-axis ticks to prevent overlapping labels
  // // Based on the number of data points, dynamically calculate a reasonable interval
  // const calculateTickInterval = () => {
  //   const count = chartData.length;
  //   if (count <= 10) return 0; // Show all ticks for small datasets
  //   if (count <= 20) return 1; // Show every other tick
  //   if (count <= 50) return 2; // Show every third tick
  //   return Math.floor(count / 20); // For larger datasets, aim for around 20 visible ticks
  // };

  // const tickInterval = calculateTickInterval();

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsBarChart
        data={chartData}
        margin={{ top: 10, right: 30, left: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="x"
          tickFormatter={formatXAxis}
          // interval={tickInterval} // Use dynamic interval
          label={{
            value: "Year",
            position: "insideBottom",
            offset: -15,
            style: { textAnchor: "middle" },
          }}
          tick={{ fontSize: 9 }} // Even smaller font for dense datasets
          angle={-45}
          textAnchor="end"
          height={70}
          scale="band" // Use band scale for continuous display
          padding={{ left: 0, right: 0 }} // Remove padding
        />
        <YAxis
          // tickFormatter={formatYAxis}
          label={{
            value: "Emissions",
            angle: -90,
            position: "insideLeft",
            style: { textAnchor: "middle" },
          }}
        />
        <Tooltip content={renderTooltip} />
        <Legend
          wrapperStyle={{ paddingTop: 5 }}
          iconSize={10} // Smaller legend icons for better fit
        />

        {/* Render stacked bars - all using the same stackId */}
        {data.map((series, index) => (
          <Bar
            key={`${series.label}-${index}`}
            dataKey={series.label}
            stackId="stack"
            fill={CHART_COLORS[index % CHART_COLORS.length]}
            // No animation for smoother display with dense data
            isAnimationActive={chartData.length < 30}
          />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  );
};

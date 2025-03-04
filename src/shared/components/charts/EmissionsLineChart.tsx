import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { CountryEmissionsData } from "@/app/api/emissions/types";

// These are some colors that work well together for a chart
const CHART_COLORS = [
  "#8884d8", // Purple
  "#82ca9d", // Green
  "#ffc658", // Yellow
  "#ff8042", // Orange
  "#0088FE", // Blue
  "#FF5733", // Red
];

interface EmissionsLineChartProps {
  data: CountryEmissionsData[];
}

export const EmissionsLineChart: React.FC<EmissionsLineChartProps> = ({
  data,
}) => {
  // Process data for the chart - this merges the data by year for all countries
  const chartData = useMemo(() => {
    // Get all years from all countries
    const allYears = new Set<string>();
    data.forEach((country) => {
      country.values.forEach((point) => {
        allYears.add(point.x);
      });
    });

    // Sort years chronologically
    const sortedYears = Array.from(allYears).sort();

    // Create a data point for each year with values for each country
    return sortedYears.map((year) => {
      const yearDataPoint: Record<string, any> = { year };

      // Add each country's value for this year
      data.forEach((country) => {
        const dataPoint = country.values.find((point) => point.x === year);
        yearDataPoint[country.country] = dataPoint ? dataPoint.y : null;
      });

      return yearDataPoint;
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
        <div className="bg-white p-3 border border-gray-200 shadow-md rounded">
          <p className="font-semibold">{`Year: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value?.toFixed(2) || "No data"}`}
            </p>
          ))}
        </div>
      );
    }

    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={chartData}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="year"
          label={{ value: "Year", position: "insideBottomRight", offset: -5 }}
        />
        <YAxis
          tickFormatter={formatYAxis}
          label={{
            value: "Emissions (Mt CO2e)",
            angle: -90,
            position: "insideLeft",
          }}
        />
        <Tooltip content={renderTooltip} />
        <Legend />

        {data.map((country, index) => (
          <Line
            key={country.countryCode}
            type="monotone"
            dataKey={country.country}
            stroke={CHART_COLORS[index % CHART_COLORS.length]}
            activeDot={{ r: 8 }}
            connectNulls
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

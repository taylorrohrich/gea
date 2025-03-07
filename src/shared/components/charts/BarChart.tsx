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
import { transformData } from "./helpers";
import { NoData } from "../NoData";
import { CHART_Y_AXIS_LABEL, COUNTRY_COLORS_MAP } from "./constants";

interface Props {
  data: Data[];
}

export function BarChart({ data }: Props) {
  const chartData = useMemo(() => transformData(data), [data]);

  // If no data exit early
  if (!data || chartData.length === 0) {
    return <NoData />;
  }
  return (
    <ResponsiveContainer>
      <RechartsBarChart
        data={chartData}
        margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="x"
          label={{ value: "X Axis", position: "insideBottom", offset: -40 }}
        />
        <YAxis
          label={{
            value: CHART_Y_AXIS_LABEL,
            angle: -90,
            position: "insideLeft",
            offset: -10,
          }}
        />
        <Tooltip formatter={(value: number) => value.toFixed(2)} />
        <Legend />
        {data.map((series) => (
          <Bar
            key={series.label}
            dataKey={series.label}
            fill={COUNTRY_COLORS_MAP[series.id]}
            stackId="stack"
          />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}

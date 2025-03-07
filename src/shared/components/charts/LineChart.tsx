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
import { CHART_Y_AXIS_LABEL, COUNTRY_COLORS_MAP } from "./constants";
import { NoData } from "../NoData";
import { transformData } from "./helpers";

interface Props {
  data: Data[];
}

export function LineChart({ data }: Props) {
  const chartData = useMemo(() => transformData(data), [data]);
  if (!data || chartData.length === 0) {
    return <NoData />;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsLineChart
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
          <Line
            key={series.label}
            dataKey={series.label}
            stroke={COUNTRY_COLORS_MAP[series.id]}
          />
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}

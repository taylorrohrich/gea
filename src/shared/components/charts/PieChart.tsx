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
import { transformData } from "./helpers";
import { NoData } from "../NoData";
import { COUNTRY_COLORS_MAP } from "./constants";

interface Props {
  data: Data[];
}

export function PieChart({ data }: Props) {
  const chartData = useMemo(
    () => transformData(data, { aggregate: true }),
    [data]
  );
  if (!data || chartData.length === 0) {
    return <NoData />;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsPieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) =>
            `${name}: ${(percent * 100).toFixed(0)}%`
          }
          outerRadius={80}
          dataKey="value"
        >
          {data.map((series) => (
            <Cell key={series.label} fill={COUNTRY_COLORS_MAP[series.id]} />
          ))}
        </Pie>
        <Tooltip formatter={(value: number) => value.toFixed(2)} />
        <Legend />
      </RechartsPieChart>
    </ResponsiveContainer>
  );
}

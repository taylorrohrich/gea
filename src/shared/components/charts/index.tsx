import { Chart } from "@/shared/types/chart";
import dynamic from "next/dynamic";
import React, { ComponentType } from "react";

// Loading component
function ChartLoading() {
  return (
    <div className="flex justify-center items-center h-full bg-gray-50 animate-pulse"></div>
  );
}

const LineChart = dynamic(
  () =>
    import("@/shared/components/charts/LineChart").then((mod) => mod.LineChart),
  {
    ssr: false,
    loading: () => <ChartLoading />,
  }
);

const BarChart = dynamic(
  () =>
    import("@/shared/components/charts/BarChart").then((mod) => mod.BarChart),
  {
    ssr: false,
    loading: () => <ChartLoading />,
  }
);

const PieChart = dynamic(
  () =>
    import("@/shared/components/charts/PieChart").then((mod) => mod.PieChart),
  {
    ssr: false,
    loading: () => <ChartLoading />,
  }
);

const MapChart = dynamic(
  () =>
    import("@/shared/components/charts/MapChart/MapChart").then(
      (mod) => mod.MapChart
    ),
  {
    ssr: false,
    loading: () => <ChartLoading />,
  }
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const CHART_COMPONENT_MAP: Record<Chart, ComponentType<any>> = {
  [Chart.Line]: LineChart,
  [Chart.Bar]: BarChart,
  [Chart.Pie]: PieChart,
  [Chart.Map]: MapChart,
};

import React from "react";
import dynamic from "next/dynamic";
import { Chart } from "../../types/chart";
import { Tile } from "../grid/types";

// Dynamic imports for each chart type
const LineChart = dynamic(
  () => import("./LineChart").then((mod) => mod.LineChart),
  { ssr: false }
);
const BarChart = dynamic(
  () => import("./BarChart").then((mod) => mod.BarChart),
  { ssr: false }
);
const PieChart = dynamic(
  () => import("./PieChart").then((mod) => mod.PieChart),
  { ssr: false }
);

// Loading component
const ChartLoading = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100%",
    }}
  >
    Loading chart...
  </div>
);

interface ChartRendererProps {
  tile: Tile;
}

export const ChartRenderer: React.FC<ChartRendererProps> = ({ tile }) => {
  console.log(tile.type);
  switch (tile.type) {
    case Chart.Line:
      return <LineChart id={tile.id} />;
    case Chart.Bar:
      return <BarChart id={tile.id} />;
    case Chart.Pie:
      return <PieChart id={tile.id} />;
    case Chart.Area:
      // Fallback to line chart if area not implemented
      return <LineChart id={tile.id} />;
    case Chart.Scatter:
      // Fallback to line chart if scatter not implemented
      return <LineChart id={tile.id} />;
    default:
      return <div>Unknown chart type</div>;
  }
};

export default ChartRenderer;

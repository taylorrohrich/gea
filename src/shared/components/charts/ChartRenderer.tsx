import React, { memo } from "react";
import dynamic from "next/dynamic";
import { Chart } from "../../types/chart";
import { Tile } from "../grid/types";
import { Data } from "@/shared/types/data";

// Dynamic imports for each chart type
const LineChart = dynamic(
  () => import("./LineChart").then((mod) => mod.LineChart),
  { ssr: false, loading: () => <ChartLoading /> }
);

const BarChart = dynamic(
  () => import("./BarChart").then((mod) => mod.BarChart),
  { ssr: false, loading: () => <ChartLoading /> }
);

const PieChart = dynamic(
  () => import("./PieChart").then((mod) => mod.PieChart),
  { ssr: false, loading: () => <ChartLoading /> }
);

// Loading component
const ChartLoading = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100%",
      background: "#f9f9f9",
    }}
  >
    Loading chart...
  </div>
);

interface ChartRendererProps {
  tile: Tile;
  data: Data[];
}

// Use memo to prevent unnecessary re-renders
export const ChartRenderer: React.FC<ChartRendererProps> = memo(
  ({ tile, data }) => {
    return (
      <div style={{ height: "100%" }}>
        <div
          className="chart-drag-handle"
          style={{
            height: "10px",
            cursor: "move",
            marginBottom: "5px",
            background: "#e0e0e0",
          }}
        ></div>
        {renderChart(tile, data)}
      </div>
    );
  }
);

// Extract chart rendering logic to a separate function
function renderChart(tile: Tile, data: Data[]) {
  switch (tile.type) {
    case Chart.Line:
      return <LineChart id={tile.id} data={data} />;
    case Chart.Bar:
      return <BarChart id={tile.id} data={data} />;
    case Chart.Pie:
      return <PieChart id={tile.id} data={data} />;
    case Chart.Area:
      // Fallback to line chart if area not implemented
      return <LineChart id={tile.id} data={data} />;
    case Chart.Scatter:
      // Fallback to line chart if scatter not implemented
      return <LineChart id={tile.id} data={data} />;
    default:
      return <div>Unknown chart type</div>;
  }
}

ChartRenderer.displayName = "ChartRenderer";

export default ChartRenderer;

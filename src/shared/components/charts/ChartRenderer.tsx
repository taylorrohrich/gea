import React, { memo, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Chart } from "../../types/chart";
import { Tile, ViewMode } from "../grid/types";
import { Data } from "@/shared/types/data";
import { ChartHeader } from "./ChartHeader";
import { DataTable } from "./DataTable";

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
  onUpdateTileMetadata: (
    id: number,
    title: string,
    description: string
  ) => void;
  onDeleteTile: (id: number) => void;
  onUpdateTileViewMode: (id: number, viewMode: ViewMode) => void;
}

// Use memo to prevent unnecessary re-renders
export const ChartRenderer: React.FC<ChartRendererProps> = memo(
  ({
    tile,
    data,
    onUpdateTileMetadata,
    onDeleteTile,
    onUpdateTileViewMode,
  }) => {
    // Use the tile's viewMode from localStorage or default to "chart"
    const [viewMode, setViewMode] = useState<ViewMode>(
      tile.viewMode || "chart"
    );

    // Update the local state when the prop changes
    useEffect(() => {
      if (tile.viewMode !== viewMode) {
        setViewMode(tile.viewMode || "chart");
      }
    }, [tile.viewMode]);

    // Handle view mode changes
    const handleViewModeChange = (newMode: ViewMode) => {
      setViewMode(newMode);
      onUpdateTileViewMode(tile.id, newMode);
    };

    return (
      <div
        style={{ height: "100%", display: "flex", flexDirection: "column" }}
        className="bg-white"
      >
        {/* Chart Header Component */}
        <ChartHeader
          id={tile.id}
          title={tile.metadata.title}
          description={tile.metadata.description}
          chartType={tile.type}
          data={data}
          viewMode={viewMode}
          onUpdate={onUpdateTileMetadata}
          onDelete={onDeleteTile}
          onViewModeChange={handleViewModeChange}
        />

        {/* Chart Content Container - flex-grow to fill remaining space */}
        <div
          style={{
            flexGrow: 1,
            position: "relative", // Container is relative
            height: "calc(100% - 60px)", // Subtract header height
            overflow: "hidden", // Contain the overflow
          }}
        >
          {viewMode === "chart" ? (
            <div style={{ height: "100%", width: "100%" }}>
              {renderChart(tile, data)}
            </div>
          ) : (
            <DataTable title={tile.metadata.title} data={data} />
          )}
        </div>
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
      return <LineChart id={tile.id} data={data} />;
    case Chart.Scatter:
      return <LineChart id={tile.id} data={data} />;
    default:
      return <div>Unknown chart type</div>;
  }
}

ChartRenderer.displayName = "ChartRenderer";

export default ChartRenderer;

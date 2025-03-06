import React, { memo, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Chart } from "../../types/chart";
import { Tile, ViewMode } from "../grid/types";
import { ChartHeader } from "./ChartHeader";
import { DataTable } from "./DataTable";
import { useGridContext } from "../grid/GridContext";

// Dynamic imports for chart components
const LineChart = dynamic(
  () => import("./LineChart").then((mod) => mod.LineChart),
  {
    ssr: false,
    loading: () => <ChartLoading />,
  }
);

const BarChart = dynamic(
  () => import("./BarChart").then((mod) => mod.BarChart),
  {
    ssr: false,
    loading: () => <ChartLoading />,
  }
);

const PieChart = dynamic(
  () => import("./PieChart").then((mod) => mod.PieChart),
  {
    ssr: false,
    loading: () => <ChartLoading />,
  }
);

const MapChart = dynamic(
  () => import("./MapChart").then((mod) => mod.MapChart),
  {
    ssr: false,
    loading: () => <ChartLoading />,
  }
);

// Loading component
const ChartLoading = () => (
  <div className="flex justify-center items-center h-full bg-gray-50">
    Loading chart...
  </div>
);

interface ChartRendererProps {
  tile: Tile;
}

// Use memo to prevent unnecessary re-renders
export const ChartRenderer = memo(({ tile }: ChartRendererProps) => {
  const { data, dispatch } = useGridContext();

  // Use the tile's viewMode from localStorage or default to "chart"
  const [viewMode, setViewMode] = useState<ViewMode>(tile.viewMode || "chart");

  // Update local state when the prop changes
  useEffect(() => {
    if (tile.viewMode !== viewMode) {
      setViewMode(tile.viewMode || "chart");
    }
  }, [tile.viewMode, viewMode]);

  // Handle view mode changes
  const handleViewModeChange = (newMode: ViewMode) => {
    setViewMode(newMode);
    dispatch({
      type: "UPDATE_TILE_VIEW_MODE",
      id: tile.id,
      viewMode: newMode,
    });
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <ChartHeader
        id={tile.id}
        title={tile.metadata.title}
        description={tile.metadata.description}
        chartType={tile.type}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
      />

      <div className="flex-grow relative h-[calc(100%-60px)] overflow-hidden">
        {viewMode === "chart" ? (
          <div className="h-full w-full">{renderChart(tile, data)}</div>
        ) : (
          <DataTable title={tile.metadata.title} chartType={tile.type} />
        )}
      </div>
    </div>
  );
});

// Extract chart rendering logic to a separate function
function renderChart(tile: Tile, data: Data[]) {
  switch (tile.type) {
    case Chart.Line:
      return <LineChart id={tile.id} data={data} />;
    case Chart.Bar:
      return <BarChart id={tile.id} data={data} />;
    case Chart.Pie:
      return <PieChart id={tile.id} data={data} />;
    case Chart.Map:
      return <MapChart id={tile.id} data={data} />;
    default:
      return <div>Unknown chart type</div>;
  }
}

ChartRenderer.displayName = "ChartRenderer";

export default ChartRenderer;

import React, { memo, useMemo } from "react";
import { Tile as TileType, ViewMode } from "../Grid/types";
import { TileHeader } from "./TileHeader";
import { DataTable } from "../charts/Table";
import { useGridContext } from "../Grid/GridContext";
import { CHART_COMPONENT_MAP } from "../charts";

interface Props {
  tile: TileType;
}

// memoize to prevent rerenders
export const Tile = memo(({ tile }: Props) => {
  const { data } = useGridContext();

  const viewMode = tile.viewMode ?? ViewMode.Chart;

  const Chart = useMemo(() => CHART_COMPONENT_MAP[tile.type], [tile.type]);
  return (
    <div
      className="h-full flex flex-col bg-white rounded-lg p-2.5 shadow-sm w-full cursor-default"
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <TileHeader tile={tile} />
      <div className="flex-grow overflow-hidden">
        {viewMode === "chart" ? (
          <Chart tile={tile} data={data} />
        ) : (
          <DataTable chartType={tile.type} data={data} />
        )}
      </div>
    </div>
  );
});

Tile.displayName = "Tile";

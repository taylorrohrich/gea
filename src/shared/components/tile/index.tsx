import React, { memo, useMemo } from "react";
import { Tile as TileType } from "../grid/types";
import { TileHeader } from "./TileHeader";
import { DataTable } from "../charts/DataTable";
import { useGridContext } from "../grid/GridContext";
import { CHART_COMPONENT_MAP } from "../charts";

interface Props {
  tile: TileType;
}

export const Tile = memo(({ tile }: Props) => {
  const { data } = useGridContext();

  const viewMode = tile.viewMode ?? "chart";

  const Chart = useMemo(() => CHART_COMPONENT_MAP[tile.type], [tile.type]);
  return (
    <div className="h-full flex flex-col bg-white rounded-lg p-2.5 shadow-sm overflow-hidden w-full">
      <TileHeader tile={tile} />
      <div className="flex-grow relative overflow-hidden">
        {viewMode === "chart" ? (
          <Chart tile={tile} data={data} />
        ) : (
          <DataTable title={tile.metadata.title} chartType={tile.type} />
        )}
      </div>
    </div>
  );
});

Tile.displayName = "Tile";

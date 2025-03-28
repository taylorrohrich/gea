import { Chart } from "@/shared/types/chart";
import { Layout } from "react-grid-layout";
import { Tile, ViewMode } from "./types";
import { GRID_COLS, TILE_HEIGHT, TILE_WIDTH } from "./constants";
import { pick } from "lodash";

// Generates a default chart title based on the chart type
export function getDefaultTitle(chartType: Chart): string {
  const prefix = chartType.charAt(0).toUpperCase() + chartType.slice(1);
  return `${prefix} Chart`;
}

// Converts tile configurations to react-grid-layout format
export function createLayoutFromTiles(tiles: Tile[]): Layout[] {
  return tiles.map((tile) => ({
    i: `tile-${tile.id}`,
    ...pick(tile.layout, ["x", "y", "w", "h"]),
  }));
}

// Updates tiles configuration from layout changes
export function updateTilesFromLayout(
  tiles: Tile[],
  newLayout: Layout[]
): Tile[] {
  // Create a map for quick lookup
  const layoutMap = new Map(newLayout.map((item) => [item.i, item]));

  return tiles.map((tile) => {
    const layoutItem = layoutMap.get(`tile-${tile.id}`);

    if (layoutItem) {
      return {
        ...tile,
        layout: pick(layoutItem, ["x", "y", "w", "h"]),
      };
    }
    return tile;
  });
}

// Creates a new tile
export function createNewTile(
  tiles: Tile[],
  chartType: Chart,
  position: { x: number; y: number }
): Tile {
  // Create a new tile ID
  const newTileId =
    Math.max(...tiles.map((tile) => tile.id).concat([-1]), 0) + 1;

  // Ensure x doesn't exceed max columns
  const safeX = Math.min(position.x, GRID_COLS - TILE_WIDTH);

  // Create new tile config
  return {
    id: newTileId,
    type: chartType,
    layout: {
      x: safeX,
      y: position.y,
      w: TILE_WIDTH,
      h: TILE_HEIGHT,
    },
    metadata: {
      title: getDefaultTitle(chartType),
      description: `Showing data visualization using ${chartType} chart`,
    },
    viewMode: ViewMode.Chart,
  };
}

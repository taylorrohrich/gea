import { Chart } from "@/shared/types/chart";
import { Layout } from "react-grid-layout";
import { Tile } from "./types";

const chartTypes = Object.values(Chart);
/**
 * Generates a default chart title based on the chart type
 */
export function getDefaultTitle(chartType: Chart): string {
  const prefix = chartType.charAt(0).toUpperCase() + chartType.slice(1);
  return `${prefix} Chart`;
}

/**
 * Creates default tile configurations
 */
export function createDefaultTiles(
  cols: number,
  tileWidth: number,
  tileHeight: number
): Tile[] {
  return [0, 1, 2].map((id) => {
    const tilesPerRow = Math.floor(cols / tileWidth);
    const row = Math.floor(id / tilesPerRow);
    const col = (id % tilesPerRow) * tileWidth;

    const chartType = chartTypes[id % chartTypes.length];
    const defaultTitle = getDefaultTitle(chartType);

    return {
      id,
      type: chartType,
      layout: {
        x: col,
        y: row * tileHeight,
        w: tileWidth,
        h: tileHeight,
      },
      metadata: {
        title: defaultTitle,
        description: `Showing data visualization using ${chartType} chart`,
      },
      viewMode: "chart",
    };
  });
}

/**
 * Converts tile configurations to react-grid-layout format
 */
export function createLayoutFromTiles(tiles: Tile[]): Layout[] {
  return tiles.map((tile) => ({
    i: `tile-${tile.id}`,
    x: tile.layout.x,
    y: tile.layout.y,
    w: tile.layout.w,
    h: tile.layout.h,
  }));
}

/**
 * Updates tiles configuration from layout changes
 */
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
        layout: {
          x: layoutItem.x,
          y: layoutItem.y,
          w: layoutItem.w,
          h: layoutItem.h,
        },
      };
    }
    return tile;
  });
}

/**
 * Creates a new tile configuration
 */
export function createNewTile(
  tiles: Tile[],
  chartType: Chart,
  position: { x: number; y: number },
  maxColumns: number,
  tileWidth: number,
  tileHeight: number
): Tile {
  // Create a new tile ID
  const newTileId =
    Math.max(...tiles.map((tile) => tile.id).concat([-1]), 0) + 1;

  // Ensure x doesn't exceed max columns
  const safeX = Math.min(position.x, maxColumns - tileWidth);

  // Create new tile config
  return {
    id: newTileId,
    type: chartType,
    layout: {
      x: safeX,
      y: position.y,
      w: tileWidth,
      h: tileHeight,
    },
    metadata: {
      title: getDefaultTitle(chartType),
      description: `Showing data visualization using ${chartType} chart`,
    },
    viewMode: "chart",
  };
}

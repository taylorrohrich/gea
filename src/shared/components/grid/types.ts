import { Chart } from "../../types/chart";

// Define the view mode options
export type ViewMode = "chart" | "table";

interface TileLayout {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface TileMetadata {
  title: string;
  description: string;
}

interface BaseTile {
  id: number;
  layout: TileLayout;
  metadata: TileMetadata;
  viewMode?: ViewMode; // Add viewMode property to save chart/table preference
}

interface LineTile extends BaseTile {
  type: Chart.Line;
}

interface BarTile extends BaseTile {
  type: Chart.Bar;
}

interface PieTile extends BaseTile {
  type: Chart.Pie;
}

interface AreaTile extends BaseTile {
  type: Chart.Area;
}

interface ScatterTile extends BaseTile {
  type: Chart.Scatter;
}

interface MapTile extends BaseTile {
  type: Chart.Map;
}

export type Tile =
  | LineTile
  | BarTile
  | PieTile
  | AreaTile
  | ScatterTile
  | MapTile;

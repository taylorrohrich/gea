import { Chart } from "../../types/chart";

// Define the view mode options
export enum ViewMode {
  Chart = "chart",
  Table = "table",
}

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

export interface Tile {
  id: number;
  layout: TileLayout;
  metadata: TileMetadata;
  viewMode?: ViewMode;
  type: Chart;
}

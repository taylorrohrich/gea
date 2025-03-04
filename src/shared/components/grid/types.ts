import { Chart } from "../../types/chart";

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

export type Tile = LineTile | BarTile | PieTile | AreaTile | ScatterTile;

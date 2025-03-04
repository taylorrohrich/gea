import { Chart } from "../../types/chart";

interface BaseTile {
  id: number;
  layout: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
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

import { Chart } from "@/shared/types/chart";
import { Tile } from "./types";

export const GRID_COLS = 4;
export const ROW_HEIGHT = 100;
export const TILE_WIDTH = 2;
export const TILE_HEIGHT = 4;
export const LOCAL_STORAGE_KEY = "grid-tiles-config";

export const DEFAULT_CONFIG: Tile[] = [
  {
    id: 1,
    type: Chart.Line,
    layout: { x: 0, y: 0, w: 4, h: 4 },
    metadata: {
      title: "Greenhouse Gas Emissions Line Chart",
      description:
        "Note changes in trends within individual countries over time",
    },
    viewMode: "chart",
  },
  {
    id: 2,
    type: Chart.Bar,
    layout: { x: 0, y: 4, w: 4, h: 3 },
    metadata: {
      title: "Greenhouse Gas Emissions Bar Chart",
      description: "See how the stacked emissions vary by year",
    },
    viewMode: "chart",
  },
  {
    id: 3,
    type: Chart.Pie,
    layout: { x: 2, y: 7, w: 2, h: 5 },
    metadata: {
      title: "Greenhouse Gas Emissions Pie Chart",
      description: "View aggregated emissions by country",
    },
    viewMode: "chart",
  },
  {
    id: 4,
    type: Chart.Map,
    layout: { x: 0, y: 7, w: 2, h: 5 },
    metadata: {
      title: "Greenhouse Gas Emissions Map Chart",
      description:
        "Analyze the geographical correlation with greenhouse emissions",
    },
    viewMode: "chart",
  },
  {
    id: 5,
    type: Chart.Line,
    layout: { x: 0, y: 12, w: 4, h: 4 },
    metadata: {
      title: "Greenhouse Gas Emissions Table (Line Chart)",
      description: "Analyze the raw data per year by country",
    },
    viewMode: "table",
  },
];

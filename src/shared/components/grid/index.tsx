"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  use,
} from "react";
import GridLayout, { Layout, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { Tile } from "./types";
import { Chart } from "../../types/chart";
import dynamic from "next/dynamic";
import { debounce } from "lodash"; // You might need to install this: npm install lodash
import { Data } from "@/shared/types/data";

// Dynamically import ChartRenderer with no SSR
const ChartRenderer = dynamic(
  () => import("../charts/ChartRenderer").then((mod) => mod.ChartRenderer),
  { ssr: false, loading: () => <div>Loading chart components...</div> }
);

type GridProps = {
  tileWidth?: number;
  tileHeight?: number;
  localStorageKey?: string;
  data: Promise<Data[]>;
};

export const Grid = ({
  tileWidth = 2,
  tileHeight = 2,
  localStorageKey = "grid-tiles-config",
  data,
}: GridProps) => {
  const awaitedData = use(data);
  console.log(awaitedData);
  const gridRef = useRef<HTMLDivElement>(null);
  const cols = 4;
  const chartTypes = useMemo<Chart[]>(
    () => [Chart.Line, Chart.Bar, Chart.Pie, Chart.Area, Chart.Scatter],
    []
  );

  const [currentChartType, setCurrentChartType] = useState<Chart>(Chart.Line);

  // Use a memoized version of WidthProvider to prevent unnecessary re-renders
  const ResponsiveGridLayout = useMemo(() => WidthProvider(GridLayout), []);

  // Generate default chart titles based on type
  const getDefaultTitle = useCallback((chartType: Chart) => {
    const prefix = chartType.charAt(0).toUpperCase() + chartType.slice(1);
    return `${prefix} Chart`;
  }, []);

  // Default tiles with metadata
  const defaultTiles = useCallback((): Tile[] => {
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
      };
    });
  }, [cols, tileWidth, tileHeight, chartTypes, getDefaultTitle]);

  // Load tiles from localStorage or use defaults
  const loadTilesConfig = useCallback((): Tile[] => {
    if (typeof window === "undefined") return defaultTiles();

    const savedConfig = localStorage.getItem(localStorageKey);
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig);

        // Upgrade old format tiles if they don't have metadata
        return parsedConfig.map((tile: any) => {
          if (!tile.metadata) {
            const defaultTitle = getDefaultTitle(tile.type);
            return {
              ...tile,
              metadata: {
                title: defaultTitle,
                description: `Showing data visualization using ${tile.type} chart`,
              },
            };
          }
          return tile;
        });
      } catch (e) {
        console.error("Failed to parse saved grid configuration", e);
      }
    }
    return defaultTiles();
  }, [defaultTiles, localStorageKey, getDefaultTitle]);

  const [tilesConfig, setTilesConfig] = useState<Tile[]>(() =>
    loadTilesConfig()
  );

  // Convert tile configurations to react-grid-layout format - memoized
  const createLayout = useCallback((configs: Tile[]): Layout[] => {
    return configs.map((config) => ({
      i: `tile-${config.id}`,
      x: config.layout.x,
      y: config.layout.y,
      w: config.layout.w,
      h: config.layout.h,
    }));
  }, []);

  const [layout, setLayout] = useState<Layout[]>(() =>
    createLayout(tilesConfig)
  );

  // Debounced save to localStorage to reduce writes during rapid changes
  const debouncedSave = useCallback(
    debounce((data: Tile[]) => {
      if (typeof window !== "undefined") {
        localStorage.setItem(localStorageKey, JSON.stringify(data));
      }
    }, 500),
    [localStorageKey]
  );

  // Save to localStorage whenever tiles or layout changes (debounced)
  useEffect(() => {
    debouncedSave(tilesConfig);
  }, [tilesConfig, debouncedSave]);

  // Debounced layout change handler to reduce state updates during resizing
  const handleLayoutChange = useCallback(
    debounce((newLayout: Layout[]) => {
      setLayout(newLayout);

      // Update tile configurations when layout changes
      setTilesConfig((prevTilesConfig) =>
        prevTilesConfig.map((tile) => {
          const layoutItem = newLayout.find(
            (item) => item.i === `tile-${tile.id}`
          );
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
        })
      );
    }, 50),
    []
  );

  // Cycle to next chart type
  const cycleChartType = useCallback(() => {
    const currentIndex = chartTypes.indexOf(currentChartType);
    const nextIndex = (currentIndex + 1) % chartTypes.length;
    setCurrentChartType(chartTypes[nextIndex]);
  }, [chartTypes, currentChartType]);

  // Handler to update tile metadata (title, description)
  const handleUpdateTileMetadata = useCallback(
    (id: number, title: string, description: string) => {
      setTilesConfig((prevTilesConfig) =>
        prevTilesConfig.map((tile) => {
          if (tile.id === id) {
            return {
              ...tile,
              metadata: {
                title,
                description,
              },
            };
          }
          return tile;
        })
      );
    },
    []
  );

  // Handler to delete a tile
  const handleDeleteTile = useCallback((id: number) => {
    setTilesConfig((prevTilesConfig) =>
      prevTilesConfig.filter((tile) => tile.id !== id)
    );

    setLayout((prevLayout) =>
      prevLayout.filter((item) => item.i !== `tile-${id}`)
    );
  }, []);

  // Add new tile on right click
  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();

      if (!gridRef.current) return;

      // Get grid container bounds
      const gridRect = gridRef.current.getBoundingClientRect();

      // Calculate position relative to grid
      const relX = e.clientX - gridRect.left;
      const relY = e.clientY - gridRect.top;

      // Convert to grid units
      const colWidth = gridRect.width / cols;
      const rowHeight = 100; // match rowHeight prop

      const gridX = Math.floor(relX / colWidth);
      const gridY = Math.floor(relY / rowHeight);

      // Create a new tile ID
      const newTileId = Math.max(...tilesConfig.map((tile) => tile.id), -1) + 1;

      // Ensure x doesn't exceed max columns
      const safeX = Math.min(gridX, cols - tileWidth);

      // Create new tile config with current chart type
      const defaultTitle = getDefaultTitle(currentChartType);
      const newTileConfig: Tile = {
        id: newTileId,
        type: currentChartType,
        layout: {
          x: safeX,
          y: gridY,
          w: tileWidth,
          h: tileHeight,
        },
        metadata: {
          title: defaultTitle,
          description: `Showing data visualization using ${currentChartType} chart`,
        },
      };

      // Update tiles config and layout together to reduce renders
      setTilesConfig((prev) => [...prev, newTileConfig]);
      setLayout((prev) => [
        ...prev,
        {
          i: `tile-${newTileId}`,
          x: safeX,
          y: gridY,
          w: tileWidth,
          h: tileHeight,
        },
      ]);

      // Cycle to next chart type for the next added tile
      cycleChartType();
    },
    [
      gridRef,
      cols,
      tilesConfig,
      currentChartType,
      tileWidth,
      tileHeight,
      cycleChartType,
      getDefaultTitle,
    ]
  );

  // Client-side rendering management
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Memoize the rendered tiles to prevent unnecessary re-renders
  const renderedTiles = useMemo(
    () =>
      tilesConfig.map((tileConfig) => (
        <div
          key={`tile-${tileConfig.id}`}
          style={{
            background: "#f7f7f7",
            borderRadius: "8px",
            padding: "10px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)",
            overflow: "hidden",
            height: "100%",
          }}
        >
          <div style={{ height: "100%" }}>
            <ChartRenderer
              tile={tileConfig}
              data={awaitedData}
              onUpdateTileMetadata={handleUpdateTileMetadata}
              onDeleteTile={handleDeleteTile}
            />
          </div>
        </div>
      )),
    [tilesConfig, awaitedData, handleUpdateTileMetadata, handleDeleteTile]
  );

  if (!isClient) {
    return null;
  }

  return (
    <div>
      <div style={{ marginBottom: "10px" }}>
        <p>Current chart type: {currentChartType}</p>
        <button onClick={cycleChartType}>
          Change chart type (currently: {currentChartType})
        </button>
        {awaitedData.length > 0 && (
          <p>Showing data for {awaitedData.length} data series</p>
        )}
        <p className="text-sm text-gray-500 mt-1">
          Right-click on the grid to add a new chart
        </p>
      </div>
      <div
        ref={gridRef}
        style={{ width: "100%", overflow: "hidden" }}
        onContextMenu={handleContextMenu}
      >
        <ResponsiveGridLayout
          className="layout"
          layout={layout}
          cols={cols}
          onLayoutChange={handleLayoutChange}
          rowHeight={100}
          compactType="vertical"
          useCSSTransforms={true}
          measureBeforeMount={false}
          isDraggable
          draggableHandle=".drag-handle"
          // Add a buffer to prevent resize jumpiness
          margin={[20, 20]}
        >
          {renderedTiles}
        </ResponsiveGridLayout>
      </div>
    </div>
  );
};

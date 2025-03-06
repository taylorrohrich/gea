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
import { Tile, ViewMode } from "./types";
import { Chart } from "../../types/chart";
import { ChartRenderer } from "../charts/ChartRenderer";
import { debounce } from "lodash";
import { Data } from "@/shared/types/data";
import { ContextMenu } from "./ContextMenu";
import {
  createDefaultTiles,
  createLayoutFromTiles,
  updateTilesFromLayout,
  createNewTile,
} from "./helpers";

interface Props {
  tileWidth?: number;
  tileHeight?: number;
  localStorageKey?: string;
  data: Promise<Data[]>;
}

export function Grid({
  tileWidth = 2,
  tileHeight = 4,
  localStorageKey = "grid-tiles-config",
  data,
}: Props) {
  const awaitedData = use(data);
  const gridRef = useRef<HTMLDivElement>(null);
  const [contextMenuPos, setContextMenuPos] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [gridPos, setGridPos] = useState<{ x: number; y: number } | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Grid configuration constants
  const cols = 4;
  const rowHeight = 100;

  // Available chart types
  const chartTypes = useMemo<Chart[]>(
    () => [
      Chart.Line,
      Chart.Bar,
      Chart.Pie,
      Chart.Area,
      Chart.Scatter,
      Chart.Map,
    ],
    []
  );

  // Use memoized version of WidthProvider to prevent unnecessary re-renders
  const ResponsiveGridLayout = useMemo(() => WidthProvider(GridLayout), []);

  // Load tiles from localStorage or use defaults
  const loadTilesConfig = useCallback((): Tile[] => {
    if (typeof window === "undefined") {
      return createDefaultTiles(chartTypes, cols, tileWidth, tileHeight);
    }

    const savedConfig = localStorage.getItem(localStorageKey);
    if (!savedConfig) {
      return createDefaultTiles(chartTypes, cols, tileWidth, tileHeight);
    }

    try {
      return JSON.parse(savedConfig);
    } catch (e) {
      console.error("Failed to parse saved grid configuration", e);
      return createDefaultTiles(chartTypes, cols, tileWidth, tileHeight);
    }
  }, [chartTypes, cols, tileWidth, tileHeight, localStorageKey]);

  // State for tiles and layout
  const [tilesConfig, setTilesConfig] = useState<Tile[]>(() =>
    loadTilesConfig()
  );
  const [layout, setLayout] = useState<Layout[]>(() =>
    createLayoutFromTiles(tilesConfig)
  );

  // Set isClient once after component mounts
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Debounced save to localStorage
  const debouncedSave = useMemo(
    () =>
      debounce((data: Tile[]) => {
        if (typeof window !== "undefined") {
          localStorage.setItem(localStorageKey, JSON.stringify(data));
        }
      }, 500),
    [localStorageKey]
  );

  // Save to localStorage when tiles change
  useEffect(() => {
    debouncedSave(tilesConfig);
  }, [tilesConfig, debouncedSave]);

  // Layout change handler
  const handleLayoutChange = useCallback((newLayout: Layout[]) => {
    setLayout(newLayout);
    setTilesConfig((prev) => updateTilesFromLayout(prev, newLayout));
  }, []);

  // Debounced layout change handler
  const debouncedHandleLayoutChange = useMemo(
    () => debounce(handleLayoutChange, 50),
    [handleLayoutChange]
  );

  // Create new tile
  const createTile = useCallback(
    (chartType: Chart) => {
      if (!gridPos) return;

      const newTile = createNewTile(
        tilesConfig,
        chartType,
        gridPos,
        cols,
        tileWidth,
        tileHeight
      );

      setTilesConfig((prev) => [...prev, newTile]);
      setLayout((prev) => [
        ...prev,
        {
          i: `tile-${newTile.id}`,
          x: newTile.layout.x,
          y: newTile.layout.y,
          w: newTile.layout.w,
          h: newTile.layout.h,
        },
      ]);
    },
    [gridPos, tilesConfig, cols, tileWidth, tileHeight]
  );

  // Handle chart selection from context menu
  const handleSelectChart = useCallback(
    (chartType: Chart) => {
      createTile(chartType);
      setContextMenuPos(null);
    },
    [createTile]
  );

  // Handle closing the context menu
  const handleCloseContextMenu = useCallback(() => {
    setContextMenuPos(null);
  }, []);

  // Context menu on right click
  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      if (!gridRef.current) return;

      setContextMenuPos({ x: e.clientX, y: e.clientY });

      // Calculate position for grid placement
      const gridRect = gridRef.current.getBoundingClientRect();
      const relX = e.clientX - gridRect.left;
      const relY = e.clientY - gridRect.top;

      // Calculate grid coordinates
      const colWidth = gridRect.width / cols;
      const gridX = Math.floor(relX / colWidth);
      const gridY = Math.floor(relY / rowHeight);

      setGridPos({ x: gridX, y: gridY });
    },
    [cols, gridRef]
  );

  // Update tile metadata
  const handleUpdateTileMetadata = useCallback(
    (id: number, title: string, description: string) => {
      setTilesConfig((prev) =>
        prev.map((tile) => {
          if (tile.id === id) {
            return { ...tile, metadata: { title, description } };
          }
          return tile;
        })
      );
    },
    []
  );

  // Update tile view mode
  const handleUpdateTileViewMode = useCallback(
    (id: number, viewMode: ViewMode) => {
      setTilesConfig((prev) =>
        prev.map((tile) => {
          if (tile.id === id) {
            return { ...tile, viewMode };
          }
          return tile;
        })
      );
    },
    []
  );

  // Delete a tile
  const handleDeleteTile = useCallback((id: number) => {
    setTilesConfig((prev) => prev.filter((tile) => tile.id !== id));
    setLayout((prev) => prev.filter((item) => item.i !== `tile-${id}`));
  }, []);

  // Render tiles
  const renderedTiles = useMemo(
    () =>
      tilesConfig.map((tileConfig) => (
        <div
          key={`tile-${tileConfig.id}`}
          className="bg-white rounded-lg p-2.5 shadow-sm overflow-hidden h-full"
        >
          <div className="h-full">
            <ChartRenderer
              tile={tileConfig}
              data={awaitedData}
              onUpdateTileMetadata={handleUpdateTileMetadata}
              onDeleteTile={handleDeleteTile}
              onUpdateTileViewMode={handleUpdateTileViewMode}
            />
          </div>
        </div>
      )),
    [
      tilesConfig,
      awaitedData,
      handleUpdateTileMetadata,
      handleDeleteTile,
      handleUpdateTileViewMode,
    ]
  );

  // Wait for client-side rendering
  if (!isClient) {
    return null;
  }

  return (
    <div>
      <div className="bg-gray-100 relative rounded-lg border border-dashed border-gray-300 min-h-[500px] flex flex-col">
        <div
          ref={gridRef}
          className="w-full overflow-hidden cursor-context-menu pb-12 h-full flex-1"
          onContextMenu={handleContextMenu}
        >
          <ResponsiveGridLayout
            className="layout"
            layout={layout}
            cols={cols}
            onLayoutChange={debouncedHandleLayoutChange}
            rowHeight={rowHeight}
            maxRows={500}
            compactType="vertical"
            useCSSTransforms={true}
            measureBeforeMount={false}
            isDraggable
            draggableHandle=".drag-handle"
            margin={[20, 20]}
          >
            {renderedTiles}
          </ResponsiveGridLayout>
        </div>

        {/* Context Menu */}
        {contextMenuPos && (
          <ContextMenu
            position={contextMenuPos}
            onSelectChart={handleSelectChart}
            onClose={handleCloseContextMenu}
          />
        )}
      </div>
    </div>
  );
}

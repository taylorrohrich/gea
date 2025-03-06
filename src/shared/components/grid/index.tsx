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
import { ChartRenderer } from "../charts/ChartRenderer";
import { debounce } from "lodash";
import { Data } from "@/shared/types/data";
import { ContextMenu } from "./ContextMenu";
import { GridProvider, useGridContext } from "./GridContext";
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

// Grid configuration constants
const cols = 4;
const rowHeight = 100;

export function Grid({
  tileWidth = 2,
  tileHeight = 4,
  localStorageKey = "grid-tiles-config",
  data,
}: Props) {
  const awaitedData = use(data);

  // Load tiles from localStorage or use defaults
  const loadTilesConfig = useCallback((): Tile[] => {
    if (typeof window === "undefined") {
      return createDefaultTiles(cols, tileWidth, tileHeight);
    }

    const savedConfig = localStorage.getItem(localStorageKey);
    if (!savedConfig) {
      return createDefaultTiles(cols, tileWidth, tileHeight);
    }

    try {
      return JSON.parse(savedConfig);
    } catch (e) {
      console.error("Failed to parse saved grid configuration", e);
      return createDefaultTiles(cols, tileWidth, tileHeight);
    }
  }, [tileWidth, tileHeight, localStorageKey]);

  // State for tiles
  const [tilesConfig, setTilesConfig] = useState<Tile[]>(() =>
    loadTilesConfig()
  );

  // Wait for client-side rendering
  const [isClient, setIsClient] = useState(false);
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

  if (!isClient) {
    return null;
  }

  return (
    <GridProvider
      initialTiles={tilesConfig}
      data={awaitedData}
      onTilesUpdate={setTilesConfig}
    >
      <GridContent
        tileWidth={tileWidth}
        tileHeight={tileHeight}
        cols={cols}
        rowHeight={rowHeight}
      />
    </GridProvider>
  );
}

// Separate component that uses the GridContext
function GridContent({
  tileWidth,
  tileHeight,
  cols,
  rowHeight,
}: {
  tileWidth: number;
  tileHeight: number;
  cols: number;
  rowHeight: number;
}) {
  const { tilesConfig, dispatch } = useGridContext();
  const gridRef = useRef<HTMLDivElement>(null);
  const [contextMenuPos, setContextMenuPos] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [gridPos, setGridPos] = useState<{ x: number; y: number } | null>(null);

  // Use memoized version of WidthProvider to prevent unnecessary re-renders
  const ResponsiveGridLayout = useMemo(() => WidthProvider(GridLayout), []);

  // Derive layout from tiles using memoization instead of separate state
  const layout = useMemo(
    () => createLayoutFromTiles(tilesConfig),
    [tilesConfig]
  );

  // Layout change handler
  const handleLayoutChange = useCallback(
    (newLayout: Layout[]) => {
      // Update tiles based on layout changes
      const updatedTiles = updateTilesFromLayout(tilesConfig, newLayout);
      dispatch({
        type: "UPDATE_TILES_FROM_LAYOUT",
        newTilesConfig: updatedTiles,
      });
    },
    [tilesConfig, dispatch]
  );

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

      // Only need to update tiles - layout will be derived automatically
      dispatch({ type: "ADD_TILE", tile: newTile });
    },
    [gridPos, tilesConfig, cols, tileWidth, tileHeight, dispatch]
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
    [cols, gridRef, rowHeight]
  );

  // Render tiles
  const renderedTiles = useMemo(
    () =>
      tilesConfig.map((tileConfig) => (
        <div
          key={`tile-${tileConfig.id}`}
          className="bg-white rounded-lg p-2.5 shadow-sm overflow-hidden h-full"
        >
          <div className="h-full">
            <ChartRenderer tile={tileConfig} />
          </div>
        </div>
      )),
    [tilesConfig]
  );

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

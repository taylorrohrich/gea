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
import dynamic from "next/dynamic";
import { debounce } from "lodash"; // You might need to install this: npm install lodash
import { Data } from "@/shared/types/data";
import { Button, Box, Paper, Tooltip, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { ContextMenu } from "./ContextMenu";
import { GridOverlay } from "./GridOverlay";

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
  const gridRef = useRef<HTMLDivElement>(null);
  const deadZoneRef = useRef<HTMLDivElement>(null);
  const [contextMenuPos, setContextMenuPos] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [gridPos, setGridPos] = useState<{ x: number; y: number } | null>(null);
  const [showOverlay, setShowOverlay] = useState(true);
  const [overlayTimer, setOverlayTimer] = useState<NodeJS.Timeout | null>(null);
  const [gridHeight, setGridHeight] = useState<number>(0);

  const cols = 4;
  const chartTypes = useMemo<Chart[]>(
    () => [Chart.Line, Chart.Bar, Chart.Pie, Chart.Area, Chart.Scatter],
    []
  );

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
        viewMode: "chart" as ViewMode, // Set default view mode
      };
    });
  }, [cols, tileWidth, tileHeight, chartTypes, getDefaultTitle]);

  // Load tiles from localStorage or use defaults - FIXED to use a ref
  const initialTilesConfigRef = useRef<Tile[] | null>(null);
  const loadTilesConfig = useCallback((): Tile[] => {
    // Only run this logic once per component mount
    if (initialTilesConfigRef.current) {
      return initialTilesConfigRef.current;
    }

    let result: Tile[];

    if (typeof window === "undefined") {
      result = defaultTiles();
    } else {
      const savedConfig = localStorage.getItem(localStorageKey);
      if (savedConfig) {
        try {
          const parsedConfig = JSON.parse(savedConfig);

          // Upgrade old format tiles if they don't have metadata or viewMode
          result = parsedConfig.map((tile: any) => {
            let updatedTile = { ...tile };

            // Add metadata if missing
            if (!updatedTile.metadata) {
              const defaultTitle = getDefaultTitle(updatedTile.type);
              updatedTile.metadata = {
                title: defaultTitle,
                description: `Showing data visualization using ${updatedTile.type} chart`,
              };
            }

            // Add viewMode if missing (default to chart)
            if (!updatedTile.viewMode) {
              updatedTile.viewMode = "chart";
            }

            return updatedTile;
          });
        } catch (e) {
          console.error("Failed to parse saved grid configuration", e);
          result = defaultTiles();
        }
      } else {
        result = defaultTiles();
      }
    }

    initialTilesConfigRef.current = result;
    return result;
  }, [defaultTiles, localStorageKey, getDefaultTitle]);
  const [currentChartType, setCurrentChartType] = useState<Chart>(Chart.Line);
  const [tilesConfig, setTilesConfig] = useState<Tile[]>(() =>
    loadTilesConfig()
  );

  // Calculate the maximum row occupied by any tile
  const calculateMaxRow = useCallback(() => {
    if (!tilesConfig.length) return -1;
    return Math.max(
      ...tilesConfig.map((tile) => tile.layout.y + tile.layout.h)
    );
  }, [tilesConfig]);

  // Ensure the grid has a minimum height
  const calculateGridMinHeight = useCallback(() => {
    const maxRow = calculateMaxRow();
    const rowHeight = 100; // Same as in GridLayout
    const minRows = 5; // Minimum number of rows to show

    // Height based on content + extra space
    const contentHeight = (maxRow + 1) * rowHeight;
    const minHeight = minRows * rowHeight;

    // Use the larger of contentHeight or minHeight
    return Math.max(contentHeight, minHeight);
  }, [calculateMaxRow]);

  // Update the grid height when tiles change
  useEffect(() => {
    const height = calculateGridMinHeight();
    setGridHeight(height);
  }, [tilesConfig, calculateGridMinHeight]);

  // Show overlay for new users or when grid is empty - FIXED dependency array
  useEffect(() => {
    // Skip running this effect during SSR
    if (typeof window === "undefined") return;

    // Show overlay if there are no tiles
    if (tilesConfig.length === 0) {
      setShowOverlay(true);
      // Clear any existing timeout
      if (overlayTimer) clearTimeout(overlayTimer);
    } else {
      // For users with existing charts, show the overlay briefly then fade it
      const timer = setTimeout(() => {
        setShowOverlay(false);
      }, 3000);
      setOverlayTimer(timer);
    }

    return () => {
      if (overlayTimer) clearTimeout(overlayTimer);
    };
  }, [tilesConfig.length]); // Removed overlayTimer from dependencies

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
  const debouncedSave = useMemo(
    () =>
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
  const handleLayoutChange = useCallback((newLayout: Layout[]) => {
    // Debounce the layout updates directly within the callback
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
  }, []);

  // Memoized debounced handler to avoid recreation on every render
  const debouncedHandleLayoutChange = useMemo(
    () => debounce(handleLayoutChange, 50),
    [handleLayoutChange]
  );

  // Create a new tile with the given chart type
  const createTile = useCallback(
    (chartType: Chart) => {
      if (!gridPos) return;

      // Create a new tile ID
      const newTileId = Math.max(...tilesConfig.map((tile) => tile.id), -1) + 1;

      // Ensure x doesn't exceed max columns
      const safeX = Math.min(gridPos.x, cols - tileWidth);

      // Create new tile config
      const defaultTitle = getDefaultTitle(chartType);
      const newTileConfig: Tile = {
        id: newTileId,
        type: chartType,
        layout: {
          x: safeX,
          y: gridPos.y,
          w: tileWidth,
          h: tileHeight,
        },
        metadata: {
          title: defaultTitle,
          description: `Showing data visualization using ${chartType} chart`,
        },
        viewMode: "chart", // Set default view mode
      };

      // Update tiles config and layout
      setTilesConfig((prev) => [...prev, newTileConfig]);
      setLayout((prev) => [
        ...prev,
        {
          i: `tile-${newTileId}`,
          x: safeX,
          y: gridPos.y,
          w: tileWidth,
          h: tileHeight,
        },
      ]);

      // Hide the overlay once user adds a chart
      setShowOverlay(false);
    },
    [gridPos, tilesConfig, cols, tileWidth, tileHeight, getDefaultTitle]
  );

  // Handler for chart selection from context menu
  const handleSelectChart = useCallback(
    (chartType: Chart) => {
      createTile(chartType);
      // Close the context menu
      setContextMenuPos(null);
    },
    [createTile]
  );

  // Handle closing the context menu
  const handleCloseContextMenu = useCallback(() => {
    setContextMenuPos(null);
  }, []);

  // Cycle to next chart type
  const cycleChartType = useCallback(() => {
    const currentIndex = chartTypes.indexOf(currentChartType);
    const nextIndex = (currentIndex + 1) % chartTypes.length;
    setCurrentChartType(chartTypes[nextIndex]);
  }, [chartTypes, currentChartType]);

  // Context menu on right click
  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();

      if (!gridRef.current) return;

      // Position for context menu
      setContextMenuPos({ x: e.clientX, y: e.clientY });

      // Calculate position for grid placement
      const gridRect = gridRef.current.getBoundingClientRect();
      const relX = e.clientX - gridRect.left;
      const relY = e.clientY - gridRect.top;
      const colWidth = gridRect.width / cols;
      const rowHeight = 100; // match rowHeight prop

      // Calculate grid coordinates
      let gridX = Math.floor(relX / colWidth);
      let gridY = Math.floor(relY / rowHeight);

      // Check if we're in the dead zone - if so, append to the end
      const maxRow = calculateMaxRow();
      if (e.currentTarget === deadZoneRef.current) {
        gridY = maxRow + 1; // Position new tile just after the last row
      }

      // Store grid position for when a chart type is selected
      setGridPos({ x: gridX, y: gridY });
    },
    [gridRef, cols, calculateMaxRow]
  );

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

  // Handler to update tile view mode
  const handleUpdateTileViewMode = useCallback(
    (id: number, viewMode: ViewMode) => {
      setTilesConfig((prevTilesConfig) =>
        prevTilesConfig.map((tile) => {
          if (tile.id === id) {
            return {
              ...tile,
              viewMode,
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

  // Client-side rendering management
  const [isClient, setIsClient] = useState(false);

  // Set isClient only once after component mounts
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
            backgroundColor: "white",
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

  if (!isClient) {
    return null;
  }

  return (
    <div>
      <Box
        sx={{
          mb: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          {awaitedData.length > 0 && (
            <Typography variant="body2">
              Showing data for {awaitedData.length} data series
            </Typography>
          )}
        </Box>
        <Tooltip title="Right-click on the grid to add a chart">
          <Button
            variant="outlined"
            color="primary"
            startIcon={<AddIcon />}
            size="small"
            onClick={() => {
              // Simulate a right click in the middle of the grid
              if (gridRef.current) {
                const rect = gridRef.current.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;

                // Create a synthetic event object with clientX and clientY
                const fakeEvent = {
                  preventDefault: () => {},
                  clientX: centerX,
                  clientY: centerY,
                  currentTarget: gridRef.current,
                };

                // Call handleContextMenu with the fake event
                handleContextMenu(fakeEvent as unknown as React.MouseEvent);
              }
            }}
          >
            Add Chart
          </Button>
        </Tooltip>
      </Box>

      <Paper
        elevation={0}
        sx={{
          backgroundColor: "grey.50",
          position: "relative",
          borderRadius: 2,
          border: "1px dashed #ccc",
          minHeight: "500px",
        }}
      >
        <div
          ref={gridRef}
          style={{
            width: "100%",
            minHeight: `${gridHeight + 300}px`,
            overflow: "hidden",
            cursor: "context-menu",
          }}
          onContextMenu={handleContextMenu}
        >
          <ResponsiveGridLayout
            className="layout"
            layout={layout}
            cols={cols}
            onLayoutChange={debouncedHandleLayoutChange}
            rowHeight={100}
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

          {/* Grid Overlay with Instructions */}
          <GridOverlay
            visible={showOverlay}
            hasCharts={tilesConfig.length > 0}
          />
        </div>

        {/* Dead zone for adding new charts at the bottom
        <div
          ref={deadZoneRef}
          style={{
            width: "100%",
            height: "200px",
            cursor: "context-menu",
            // background:
            //   "linear-gradient(to bottom, rgba(240,240,240,0.2), rgba(240,240,240,0.6))",
            // borderTop: "1px dashed rgba(0,0,0,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "rgba(0,0,0,0.3)",
          }}
          onContextMenu={handleContextMenu}
          onClick={(e) => {
            // Allow left-click in the dead zone to also add charts
            const rect = deadZoneRef.current?.getBoundingClientRect();
            if (rect) {
              const fakeEvent = {
                preventDefault: () => {},
                clientX: e.clientX,
                clientY: e.clientY,
                currentTarget: deadZoneRef.current,
              };
              handleContextMenu(fakeEvent as unknown as React.MouseEvent);
            }
          }}
        >
          <Typography
            variant="body2"
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            <AddIcon fontSize="small" /> Right-click or click here to add
            another chart
          </Typography>
        </div> */}

        {/* Context Menu */}
        {contextMenuPos && (
          <ContextMenu
            position={contextMenuPos}
            onSelectChart={handleSelectChart}
            onClose={handleCloseContextMenu}
          />
        )}
      </Paper>
    </div>
  );
};

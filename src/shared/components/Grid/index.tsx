"use client";

import React, {
  useState,
  useRef,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import GridLayout, { Layout, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { Chart } from "../../types/chart";
import { Tile } from "@/shared/components/Tile";
import { debounce } from "lodash";
import { ContextMenu } from "./ContextMenu";
import { GridActionType, useGridContext } from "./GridContext";
import {
  createLayoutFromTiles,
  updateTilesFromLayout,
  createNewTile,
} from "./helpers";
import { GRID_COLS, ROW_HEIGHT } from "./constants";
import { Button } from "@mui/material";

export function Grid() {
  const [isClient, setIsClient] = useState(false);
  const [contextMenuPos, setContextMenuPos] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [gridPos, setGridPos] = useState<{ x: number; y: number } | null>(null);
  const { tiles, dispatch } = useGridContext();
  const gridRef = useRef<HTMLDivElement>(null);

  /* 
   Strange way to go about it, but recommended on 
   https://github.com/react-grid-layout/react-grid-layout?tab=readme-ov-file#react-hooks-performance 
   to prevent unnecessary re-renders
   */
  const ResponsiveGridLayout = useMemo(() => WidthProvider(GridLayout), []);

  // Derive layout from tiles
  const layout = useMemo(() => createLayoutFromTiles(tiles), [tiles]);

  // Render tiles
  const renderedTiles = useMemo(
    () =>
      tiles.map((tile) => (
        <div key={`tile-${tile.id}`}>
          <Tile tile={tile} />
        </div>
      )),
    [tiles]
  );

  // Layout change handler
  const handleLayoutChange = useCallback(
    (newLayout: Layout[]) => {
      // Update tiles based on layout changes
      const updatedTiles = updateTilesFromLayout(tiles, newLayout);
      dispatch({
        type: GridActionType.UPDATE_TILES_FROM_LAYOUT,
        newTilesConfig: updatedTiles,
      });
    },
    [tiles, dispatch]
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

      const newTile = createNewTile(tiles, chartType, gridPos);
      dispatch({ type: GridActionType.ADD_TILE, tile: newTile });
    },
    [gridPos, tiles, dispatch]
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
      const colWidth = gridRect.width / GRID_COLS;
      const gridX = Math.floor(relX / colWidth);
      const gridY = Math.floor(relY / ROW_HEIGHT);

      setGridPos({ x: gridX, y: gridY });
    },
    [gridRef]
  );

  useEffect(() => setIsClient(true), []);

  if (!isClient) return null;

  return (
    <>
      <div className="bg-gray-100 relative rounded-lg border border-dashed border-gray-300 min-h-[500px] flex flex-col">
        <div
          ref={gridRef}
          className="w-full overflow-hidden cursor-context-menu pb-12 h-full flex-1"
          onContextMenu={handleContextMenu}
        >
          {layout.length ? (
            <ResponsiveGridLayout
              className="layout"
              layout={layout}
              cols={GRID_COLS}
              onLayoutChange={debouncedHandleLayoutChange}
              rowHeight={ROW_HEIGHT}
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
          ) : (
            <div className="w-full h-[500px] mx-auto flex items-center justify-center ">
              <div>Right-click to add a chart</div>
            </div>
          )}
        </div>
        {contextMenuPos && (
          <ContextMenu
            position={contextMenuPos}
            onSelectChart={handleSelectChart}
            onClose={handleCloseContextMenu}
          />
        )}
      </div>
      <Button
        onClick={() => {
          dispatch({
            type: GridActionType.RESET_GRID,
          });
          localStorage.clear();
        }}
      >
        Reset Grid To Example
      </Button>
    </>
  );
}

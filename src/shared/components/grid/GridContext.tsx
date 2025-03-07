"use client";
import {
  createContext,
  useContext,
  Dispatch,
  useReducer,
  useMemo,
  PropsWithChildren,
  useEffect,
  use,
} from "react";
import { Tile, ViewMode } from "./types";
import { Data } from "@/shared/types/data";
import { debounce } from "lodash";
import { DEFAULT_CONFIG, LOCAL_STORAGE_KEY } from "./constants";

// Define action types using an enum for better type safety
export enum GridActionType {
  UPDATE_TILE_METADATA = "UPDATE_TILE_METADATA",
  DELETE_TILE = "DELETE_TILE",
  UPDATE_TILE_VIEW_MODE = "UPDATE_TILE_VIEW_MODE",
  UPDATE_TILES_FROM_LAYOUT = "UPDATE_TILES_FROM_LAYOUT",
  ADD_TILE = "ADD_TILE",
  RESET_GRID = "RESET_GRID",
}

// Define action interfaces
export type GridAction =
  | {
      type: GridActionType.UPDATE_TILE_METADATA;
      id: number;
      title: string;
      description: string;
    }
  | { type: GridActionType.DELETE_TILE; id: number }
  | {
      type: GridActionType.UPDATE_TILE_VIEW_MODE;
      id: number;
      viewMode: ViewMode;
    }
  | { type: GridActionType.UPDATE_TILES_FROM_LAYOUT; newTilesConfig: Tile[] }
  | { type: GridActionType.ADD_TILE; tile: Tile }
  | { type: GridActionType.RESET_GRID };

// Define the context state and value types
export interface GridContextState {
  tiles: Tile[];
}

export interface GridContextValue extends GridContextState {
  dispatch: Dispatch<GridAction>;
  data: Data[];
}

// Create the context
const GridContext = createContext<GridContextValue | undefined>(undefined);

// Define reducer function - only handles tile updates
export function gridReducer(
  state: GridContextState,
  action: GridAction
): GridContextState {
  switch (action.type) {
    case GridActionType.RESET_GRID:
      return {
        ...state,
        tiles: DEFAULT_CONFIG,
      };
    case GridActionType.UPDATE_TILE_METADATA:
      return {
        ...state,
        tiles: state.tiles.map((tile) => {
          if (tile.id === action.id) {
            return {
              ...tile,
              metadata: {
                title: action.title,
                description: action.description,
              },
            };
          }
          return tile;
        }),
      };

    case GridActionType.DELETE_TILE:
      return {
        ...state,
        tiles: state.tiles.filter((tile) => tile.id !== action.id),
      };

    case GridActionType.UPDATE_TILE_VIEW_MODE:
      return {
        ...state,
        tiles: state.tiles.map((tile) => {
          if (tile.id === action.id) {
            return { ...tile, viewMode: action.viewMode };
          }
          return tile;
        }),
      };

    case GridActionType.UPDATE_TILES_FROM_LAYOUT:
      return {
        ...state,
        tiles: action.newTilesConfig,
      };

    case GridActionType.ADD_TILE:
      return {
        ...state,
        tiles: [...state.tiles, action.tile],
      };

    default:
      return state;
  }
}

// Custom hook to use the context
export function useGridContext() {
  const context = useContext(GridContext);
  if (context === undefined) {
    throw new Error(
      "useGridContext must be used within a GridContext.Provider"
    );
  }
  return context;
}

// Export the provider directly
const GridContextProvider = GridContext.Provider;
const saveTiles = debounce((data: Tile[]) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  }
}, 500);

// Save to localStorage when tiles change
export function GridProvider({
  data: promiseData,
  children,
}: PropsWithChildren<{ data: Promise<Data[]> }>) {
  const data = use(promiseData);
  // Initialize tiles configuration
  const initialTiles = useMemo(() => {
    if (typeof window === "undefined") {
      return DEFAULT_CONFIG;
    }

    const savedConfig = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!savedConfig) {
      return DEFAULT_CONFIG;
    }

    try {
      return JSON.parse(savedConfig);
    } catch (e) {
      console.error("Failed to parse saved grid configuration", e);
      return DEFAULT_CONFIG;
    }
  }, []);

  // Set up the reducer for tiles management
  const [state, dispatch] = useReducer(gridReducer, { tiles: initialTiles });

  const providerValue = useMemo(
    () => ({ tiles: state.tiles, data, dispatch }),
    [state.tiles, data]
  );

  useEffect(() => {
    saveTiles(state.tiles);
  }, [state.tiles]);

  // Pass the state and dispatch to children via context
  return (
    <GridContextProvider value={providerValue}>{children}</GridContextProvider>
  );
}

import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  Dispatch,
} from "react";
import { Tile, ViewMode } from "./types";
import { Data } from "@/shared/types/data";

// Define the context state type
interface GridContextState {
  tilesConfig: Tile[];
  data: Data[];
}

// Define action types
type GridAction =
  | {
      type: "UPDATE_TILE_METADATA";
      id: number;
      title: string;
      description: string;
    }
  | { type: "DELETE_TILE"; id: number }
  | { type: "UPDATE_TILE_VIEW_MODE"; id: number; viewMode: ViewMode }
  | { type: "UPDATE_TILES_FROM_LAYOUT"; newTilesConfig: Tile[] }
  | { type: "ADD_TILE"; tile: Tile };

// Define the context value type including the dispatch function
interface GridContextValue extends GridContextState {
  dispatch: Dispatch<GridAction>;
}

// Create the context with a default empty value
const GridContext = createContext<GridContextValue | undefined>(undefined);

// Define reducer function
function gridReducer(
  state: GridContextState,
  action: GridAction
): GridContextState {
  switch (action.type) {
    case "UPDATE_TILE_METADATA":
      return {
        ...state,
        tilesConfig: state.tilesConfig.map((tile) => {
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

    case "DELETE_TILE":
      return {
        ...state,
        tilesConfig: state.tilesConfig.filter((tile) => tile.id !== action.id),
      };

    case "UPDATE_TILE_VIEW_MODE":
      return {
        ...state,
        tilesConfig: state.tilesConfig.map((tile) => {
          if (tile.id === action.id) {
            return { ...tile, viewMode: action.viewMode };
          }
          return tile;
        }),
      };

    case "UPDATE_TILES_FROM_LAYOUT":
      return {
        ...state,
        tilesConfig: action.newTilesConfig,
      };

    case "ADD_TILE":
      return {
        ...state,
        tilesConfig: [...state.tilesConfig, action.tile],
      };

    default:
      return state;
  }
}

// Create a provider component
interface GridProviderProps {
  children: ReactNode;
  initialTiles: Tile[];
  data: Data[];
  onTilesUpdate: (tiles: Tile[]) => void;
}

export function GridProvider({
  children,
  initialTiles,
  data,
  onTilesUpdate,
}: GridProviderProps) {
  const [state, dispatch] = useReducer(gridReducer, {
    tilesConfig: initialTiles,
    data,
  });

  // Side effect: whenever tilesConfig changes, call the onTilesUpdate callback
  React.useEffect(() => {
    onTilesUpdate(state.tilesConfig);
  }, [state.tilesConfig, onTilesUpdate]);

  return (
    <GridContext.Provider value={{ ...state, dispatch }}>
      {children}
    </GridContext.Provider>
  );
}

// Create a custom hook to use the context
export function useGridContext() {
  const context = useContext(GridContext);
  if (context === undefined) {
    throw new Error("useGridContext must be used within a GridProvider");
  }
  return context;
}

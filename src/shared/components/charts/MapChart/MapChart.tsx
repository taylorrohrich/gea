import React, { memo, useMemo, useState, useEffect, useRef } from "react";
import { Data } from "@/shared/types/data";
import { scaleLinear } from "d3-scale";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import { transformAggregateData } from "../helpers";
import { NoData } from "../../NoData";
import { GEO_DATA } from "./constants";

interface Props {
  data: Data[];
}

// memoized to prevent unnecessary re-renders
export const MapChart: React.FC<Props> = memo(({ data }: Props) => {
  // Refs for container dimensions and tooltip positioning
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });
  const [isMounted, setIsMounted] = useState(false);
  const [tooltipInfo, setTooltipInfo] = useState<{
    content: string;
    position: { x: number; y: number };
  } | null>(null);

  // Set mounted state once component is mounted
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // Handle window resize and update dimensions
  useEffect(() => {
    if (!isMounted) return;

    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };

    // Initial update
    updateDimensions();

    // Add resize listener
    window.addEventListener("resize", updateDimensions);

    // Clean up
    return () => window.removeEventListener("resize", updateDimensions);
  }, [isMounted]);

  const chartData = useMemo(() => transformAggregateData(data), [data]);

  // Calculate min and max values for the color scale
  const { minValue, maxValue } = useMemo(() => {
    const values = chartData.map((d) => d.value);
    if (values.length === 0) return { minValue: 0, maxValue: 100 };

    return {
      minValue: Math.min(...values),
      maxValue: Math.max(...values),
    };
  }, [chartData]);

  // Create color scale from light blue to dark blue
  const colorScale = useMemo(() => {
    return scaleLinear<string>()
      .domain([minValue, maxValue])
      .range(["#e3f2fd", "#1565c0"]);
  }, [minValue, maxValue]);

  // Calculate proper tooltip position relative to the container
  const getRelativeTooltipPosition = (x: number, y: number) => {
    if (!containerRef.current) return { x, y };

    const rect = containerRef.current.getBoundingClientRect();
    const offsetX = x - rect.left;
    const offsetY = y - rect.top;

    return { x: offsetX, y: offsetY };
  };

  // Early return if no data
  if (!data.length) {
    return <NoData />;
  }

  // Render the map
  return (
    <div className="relative w-full h-full overflow-hidden" ref={containerRef}>
      {/* Custom tooltip */}
      {tooltipInfo && (
        <div
          className="absolute p-1 bg-white bg-opacity-95 shadow-lg rounded border border-gray-200 pointer-events-none z-50"
          style={{
            top: tooltipInfo.position.y - 10, // Offset above cursor
            left: tooltipInfo.position.x,
            transform: "translate(-50%, -100%)",
          }}
        >
          <span className="text-xs">{tooltipInfo.content}</span>
        </div>
      )}
      <div className="w-full h-full">
        <ComposableMap
          projectionConfig={{
            scale: 150,
          }}
          style={{
            width: "100%",
            height: "100%",
            background: "#F1F5F9",
          }}
          width={dimensions.width}
          height={dimensions.height}
        >
          <ZoomableGroup center={[0, 0]} zoom={1}>
            <Geographies geography={GEO_DATA}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  // Get name either from NAME, name
                  const countryName =
                    geo.properties?.NAME || geo.properties?.name;

                  // Try to find a match in our data (case insensitive)
                  const countrySeries = chartData.find(({ name }) =>
                    countryName.toLowerCase().startsWith(name.toLowerCase())
                  );

                  // Get value or default to 0
                  const value = countrySeries ? countrySeries.value : 0;
                  const fill = value > 0 ? colorScale(value) : "#F5F5F5";

                  return (
                    <Geography
                      key={geo.rsmKey || `geo-${geo.id || Math.random()}`}
                      geography={geo}
                      fill={fill}
                      stroke="#D6D6DA"
                      strokeWidth={0.5}
                      style={{
                        default: { outline: "none" },
                        hover: { outline: "none", fill: "#FFA726" },
                        pressed: { outline: "none" },
                      }}
                      onMouseEnter={(evt) => {
                        // move tooltip to cursor position when entering chart
                        const { clientX, clientY } = evt;
                        const tooltipText =
                          value > 0
                            ? `${countryName}: ${value.toFixed(2)}`
                            : `${countryName}: No data`;

                        const relativePosition = getRelativeTooltipPosition(
                          clientX,
                          clientY
                        );
                        setTooltipInfo({
                          content: tooltipText,
                          position: relativePosition,
                        });
                      }}
                      onMouseMove={(evt) => {
                        // move tooltip to cursor position when moving within chart
                        const { clientX, clientY } = evt;
                        if (tooltipInfo) {
                          const relativePosition = getRelativeTooltipPosition(
                            clientX,
                            clientY
                          );
                          setTooltipInfo((ti) =>
                            ti
                              ? {
                                  ...ti,
                                  position: relativePosition,
                                }
                              : ti
                          );
                        }
                      }}
                      onMouseLeave={() => {
                        // remove tooltip when leaving chart
                        setTooltipInfo(null);
                      }}
                    />
                  );
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>
      </div>
      <div className="absolute bottom-2 right-2 bg-white bg-opacity-90 p-1 rounded shadow border border-gray-200">
        <span className="text-xs block">Min: {minValue.toFixed(2)}</span>
        <div className="w-24 h-2 bg-gradient-to-r from-blue-100 to-blue-900 my-1 rounded"></div>
        <span className="text-xs block">Max: {maxValue.toFixed(2)}</span>
      </div>
    </div>
  );
});

MapChart.displayName = "MapChart";

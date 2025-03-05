import React, { memo, useMemo, useState, useEffect, useRef } from "react";
import { Box, Typography, CircularProgress, Alert } from "@mui/material";
import { Data } from "@/shared/types/data";
import { scaleLinear } from "d3-scale";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";

// Use reliable sources for the world map topology
// Primary source: Natural Earth via GitHub
const PRIMARY_GEO_URL =
  "https://unpkg.com/world-atlas@2.0.2/countries-110m.json";

interface MapChartProps {
  id: number;
  data: Data[];
}

export const MapChart: React.FC<MapChartProps> = memo(({ id, data }) => {
  // Refs for container dimensions and tooltip positioning
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });
  const [isMounted, setIsMounted] = useState(false);

  // State for handling map loading and errors
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [geoData, setGeoData] = useState<any>(null);
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

  // Fetch geo data
  useEffect(() => {
    const fetchGeoData = async () => {
      setIsLoading(true);
      try {
        // Try the primary URL first
        const response = await fetch(PRIMARY_GEO_URL, { cache: "force-cache" });

        if (!response.ok) {
          throw new Error("Could not load map data from either source");
        } else {
          const data = await response.json();
          setGeoData(data);
        }

        setError(null);
      } catch (err) {
        console.error("Error loading map data:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load map data"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchGeoData();
  }, []);

  // Process data to get value by country
  const countryData = useMemo(() => {
    const result: Record<string, number> = {};

    data.forEach((series) => {
      // Use the series label as the country name
      const countryName = series.label;

      // Calculate the sum of values for this series
      const sum = series.values.reduce((acc, point) => acc + point.y, 0);
      result[countryName] = sum;
    });

    return result;
  }, [data]);

  // Calculate min and max values for the color scale
  const { minValue, maxValue } = useMemo(() => {
    const values = Object.values(countryData);
    if (values.length === 0) return { minValue: 0, maxValue: 100 };

    return {
      minValue: Math.min(...values),
      maxValue: Math.max(...values),
    };
  }, [countryData]);

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

  // Handle missing data
  if (!data || data.length === 0) {
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        height="100%"
      >
        <Typography variant="body2" color="text.secondary">
          No data available for map visualization
        </Typography>
      </Box>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        height="100%"
        flexDirection="column"
        gap={2}
      >
        <CircularProgress size={40} />
        <Typography variant="body2">Loading map data...</Typography>
      </Box>
    );
  }

  // Show error if any
  if (error || !geoData) {
    return (
      <Box
        p={2}
        height="100%"
        display="flex"
        flexDirection="column"
        justifyContent="center"
      >
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || "Failed to load map data"}
        </Alert>
        <Box sx={{ overflow: "auto", flexGrow: 1 }}>
          <Typography variant="h6" gutterBottom>
            Data Summary
          </Typography>
          {Object.entries(countryData)
            .sort(([, valueA], [, valueB]) => valueB - valueA)
            .map(([country, value]) => (
              <Box
                key={country}
                sx={{ mb: 1, display: "flex", justifyContent: "space-between" }}
              >
                <Typography variant="body2">{country}:</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {value.toFixed(2)}
                </Typography>
              </Box>
            ))}
        </Box>
      </Box>
    );
  }

  // Render the map
  return (
    <Box
      height="100%"
      width="100%"
      position="relative"
      ref={containerRef}
      sx={{ overflow: "hidden" }}
    >
      {/* Custom tooltip */}
      {tooltipInfo && (
        <Box
          sx={{
            position: "absolute",
            top: tooltipInfo.position.y - 10, // Offset above cursor
            left: tooltipInfo.position.x,
            transform: "translate(-50%, -100%)",
            bgcolor: "rgba(255, 255, 255, 0.95)",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
            p: 1,
            borderRadius: 1,
            zIndex: 1000,
            pointerEvents: "none",
            border: "1px solid rgba(0, 0, 0, 0.1)",
          }}
        >
          <Typography variant="caption">{tooltipInfo.content}</Typography>
        </Box>
      )}

      <Box sx={{ height: "100%", width: "100%" }}>
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
            <Geographies geography={geoData}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  // Get name either from NAME, name, or some other property depending on the data source
                  const countryName =
                    geo.properties?.NAME || geo.properties?.name || "";

                  // Try to find a match in our data (case insensitive)
                  const countryKey = Object.keys(countryData).find((name) =>
                    countryName.toLowerCase().startsWith(name.toLowerCase())
                  );

                  // Get value or default to 0
                  const value = countryKey ? countryData[countryKey] : 0;
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
                        const { clientX, clientY } = evt;
                        if (tooltipInfo) {
                          const relativePosition = getRelativeTooltipPosition(
                            clientX,
                            clientY
                          );
                          setTooltipInfo((ti) => ({
                            ...ti,
                            position: relativePosition,
                          }));
                        }
                      }}
                      onMouseLeave={() => {
                        setTooltipInfo(null);
                      }}
                    />
                  );
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>
      </Box>

      {/* Legend */}
      <Box
        sx={{
          position: "absolute",
          bottom: 10,
          right: 10,
          bgcolor: "rgba(255, 255, 255, 0.9)",
          p: 1,
          borderRadius: 1,
          boxShadow: 1,
          border: "1px solid rgba(0, 0, 0, 0.1)",
        }}
      >
        <Typography variant="caption" display="block">
          Min: {minValue.toFixed(2)}
        </Typography>
        <Box
          sx={{
            width: 100,
            height: 10,
            background: `linear-gradient(to right, #e3f2fd, #1565c0)`,
            my: 0.5,
            borderRadius: 0.5,
          }}
        />
        <Typography variant="caption" display="block">
          Max: {maxValue.toFixed(2)}
        </Typography>
      </Box>
    </Box>
  );
});

MapChart.displayName = "MapChart";

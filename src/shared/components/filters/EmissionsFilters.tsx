import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Paper,
  Button,
  Typography,
  Divider,
  Collapse,
  IconButton,
  Chip,
  Stack,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import FilterListIcon from "@mui/icons-material/FilterList";
import { DateRangeSelector } from "./DateRangeSelector";
import { CountrySelector, COUNTRIES } from "./CountrySelector";
import { useRouter, useSearchParams } from "next/navigation";

// Import shim for React 18 useLayoutEffect SSR warning
import { useIsomorphicLayoutEffect } from "../../hooks/useIsomorphicLayoutEffect";

interface EmissionsFiltersProps {
  defaultStartYear?: number;
  defaultEndYear?: number;
  defaultCountries?: string;
  onApplyFilters?: (filters: {
    startYear: number;
    endYear: number;
    countries: string[] | "All";
  }) => void;
  sticky?: boolean;
}

export const EmissionsFilters: React.FC<EmissionsFiltersProps> = ({
  defaultStartYear = 1972,
  defaultEndYear = 2022,
  defaultCountries = "All",
  onApplyFilters,
  sticky = true,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [expanded, setExpanded] = useState(false);

  // Placeholder ref to measure the original position
  const placeholderRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  // Track scroll position
  const [isSticky, setIsSticky] = useState(false);
  const [placeholderHeight, setPlaceholderHeight] = useState(0);

  // Extract and parse query parameters - only extract once on mount or when searchParams change
  const queryStartYear = React.useMemo(() => {
    return searchParams?.get("startYear")
      ? parseInt(searchParams.get("startYear")!, 10)
      : defaultStartYear;
  }, [searchParams, defaultStartYear]);

  const queryEndYear = React.useMemo(() => {
    return searchParams?.get("endYear")
      ? parseInt(searchParams.get("endYear")!, 10)
      : defaultEndYear;
  }, [searchParams, defaultEndYear]);

  const queryCountries = React.useMemo(() => {
    return searchParams?.get("countries") || defaultCountries;
  }, [searchParams, defaultCountries]);

  // Set initial height - using useLayoutEffect to measure before paint
  useIsomorphicLayoutEffect(() => {
    if (!sticky || !filterRef.current) return;
    // Set initial height synchronously to avoid layout shift
    const height = filterRef.current.offsetHeight;
    setPlaceholderHeight(height);
  }, [sticky]);

  // Function to handle scroll events - with proper cleanup
  useEffect(() => {
    if (!sticky || typeof window === "undefined") return;

    // Use requestAnimationFrame for smoother handling
    let ticking = false;

    const handleScroll = () => {
      if (!ticking && placeholderRef.current) {
        requestAnimationFrame(() => {
          const placeholderPos =
            placeholderRef.current?.getBoundingClientRect();
          if (placeholderPos) {
            const shouldBeSticky = placeholderPos.top <= 0;
            if (shouldBeSticky !== isSticky) {
              setIsSticky(shouldBeSticky);
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    // Initial check in case we're already scrolled
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [sticky, isSticky]);

  // Update placeholder height when filter height changes
  useEffect(() => {
    if (!sticky || !filterRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setPlaceholderHeight(entry.contentRect.height);
      }
    });

    resizeObserver.observe(filterRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [sticky]);

  // Local state for filters - initialized from props/URL
  const [startYear, setStartYear] = useState(queryStartYear);
  const [endYear, setEndYear] = useState(queryEndYear);
  const [selectedCountries, setSelectedCountries] = useState<string[]>(() => {
    if (queryCountries === "All") {
      return COUNTRIES.map((c) => c.code);
    }
    return queryCountries.split(",");
  });

  // Update filter state when URL parameters change
  useEffect(() => {
    setStartYear(queryStartYear);
    setEndYear(queryEndYear);

    if (queryCountries === "All") {
      setSelectedCountries(COUNTRIES.map((c) => c.code));
    } else {
      setSelectedCountries(queryCountries.split(","));
    }
  }, [queryStartYear, queryEndYear, queryCountries]);

  // Handle date range changes
  const handleRangeChange = (newStartYear: number, newEndYear: number) => {
    setStartYear(newStartYear);
    setEndYear(newEndYear);
  };

  // Handle country selection changes
  const handleCountryChange = (selected: string[]) => {
    setSelectedCountries(selected);
  };

  // Toggle expanded state
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  // Apply filters and update URL
  const applyFilters = () => {
    const countriesParam =
      selectedCountries.length === COUNTRIES.length
        ? "All"
        : selectedCountries.join(",");

    // Call the provided callback if it exists
    if (onApplyFilters) {
      onApplyFilters({
        startYear,
        endYear,
        countries: countriesParam === "All" ? "All" : selectedCountries,
      });
    } else {
      // Only used if no callback is provided (direct URL update)
      const params = new URLSearchParams();
      params.set("startYear", startYear.toString());
      params.set("endYear", endYear.toString());
      params.set("countries", countriesParam);

      // Update the URL without refreshing the page
      router.push(`?${params.toString()}`, { scroll: false });
    }

    // Collapse the filter panel after applying
    setExpanded(false);
  };

  // Reset filters to defaults
  const resetFilters = () => {
    setStartYear(defaultStartYear);
    setEndYear(defaultEndYear);
    setSelectedCountries(COUNTRIES.map((c) => c.code));
  };

  // Render the filter component
  const filterComponent = (
    <Paper
      ref={filterRef}
      elevation={isSticky ? 4 : 2}
      sx={{
        mb: 4,
        transition: "all 0.15s ease-out", // Faster transition reduces perception of lag
        position: isSticky ? "fixed" : "relative",
        top: isSticky ? 0 : "auto",
        left: isSticky ? 0 : "auto",
        right: isSticky ? 0 : "auto",
        zIndex: isSticky ? 1100 : 1,
        width: isSticky ? "100%" : "auto",
        borderRadius: isSticky ? 0 : 1,
        maxWidth: isSticky ? "none" : "100%",
        transform: isSticky
          ? "translateZ(0)" // Hardware acceleration
          : "none",
        willChange: sticky ? "position, top" : "auto", // Optimize for animation
      }}
    >
      {/* Header - Always visible */}
      <Box
        onClick={toggleExpanded}
        sx={{
          p: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
          backgroundColor: isSticky
            ? "rgba(255, 255, 255, 0.98)"
            : "transparent",
          boxShadow: isSticky ? "0 2px 4px rgba(0,0,0,0.1)" : "none",
        }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <FilterListIcon color="primary" />
          <Typography variant="h6">Emissions Data Filters</Typography>
        </Box>

        {/* Summary when collapsed */}
        {!expanded && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              flex: 1,
              mx: 2,
              overflow: "hidden",
            }}
          >
            <Chip
              label={`Year Range: ${startYear}-${endYear}`}
              size="small"
              color="primary"
              variant="outlined"
            />

            {selectedCountries.length === COUNTRIES.length ? (
              <Chip
                label="All Countries"
                size="small"
                color="primary"
                variant="outlined"
              />
            ) : (
              <Stack
                direction="row"
                spacing={1}
                sx={{ overflow: "auto", flexWrap: "nowrap" }}
              >
                {selectedCountries.slice(0, 3).map((code) => {
                  const country = COUNTRIES.find((c) => c.code === code);
                  return (
                    <Chip
                      key={code}
                      label={country?.name || code}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  );
                })}
                {selectedCountries.length > 3 && (
                  <Chip
                    label={`+${selectedCountries.length - 3} more`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                )}
              </Stack>
            )}
          </Box>
        )}

        <IconButton
          aria-label={expanded ? "collapse" : "expand"}
          sx={{ ml: "auto" }}
        >
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>

      <Divider />

      {/* Collapsible content */}
      <Collapse in={expanded} timeout="auto">
        <Box sx={{ p: 2 }}>
          <DateRangeSelector
            startYear={startYear}
            endYear={endYear}
            onRangeChange={handleRangeChange}
          />

          <Divider sx={{ my: 2 }} />

          <CountrySelector
            selectedCountries={selectedCountries}
            onSelectionChange={handleCountryChange}
          />

          <Divider sx={{ my: 2 }} />

          <Box
            sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}
          >
            <Button variant="outlined" color="secondary" onClick={resetFilters}>
              Reset
            </Button>
            <Button variant="contained" color="primary" onClick={applyFilters}>
              Apply Filters
            </Button>
          </Box>
        </Box>
      </Collapse>
    </Paper>
  );

  // If not sticky, just return the component
  if (!sticky) return filterComponent;

  // If sticky, return with a placeholder
  return (
    <>
      {/* Invisible placeholder to maintain layout space when filter becomes fixed */}
      <div
        ref={placeholderRef}
        style={{
          height: isSticky ? placeholderHeight : 0,
          marginBottom: isSticky ? 16 : 0,
          transition: "height 0.15s ease-out", // Match the transition speed
        }}
      />

      {/* Actual filter component */}
      {filterComponent}
    </>
  );
};

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
import { useRouter } from "next/navigation";

// Import shim for React 18 useLayoutEffect SSR warning
import { useIsomorphicLayoutEffect } from "../../hooks/useIsomorphicLayoutEffect";

interface EmissionsFiltersProps {
  startYear: number;
  endYear: number;
  countries: string;
  sticky?: boolean;
}

export const EmissionsFilters: React.FC<EmissionsFiltersProps> = ({
  startYear: initialStartYear,
  endYear: initialEndYear,
  countries: initialCountries,
  sticky = true,
}) => {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);

  // Placeholder ref to measure the original position
  const placeholderRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  // Track scroll position
  const [isSticky, setIsSticky] = useState(false);
  const [placeholderHeight, setPlaceholderHeight] = useState(0);

  // Local state for filters - initialized from props
  const [startYear, setStartYear] = useState(initialStartYear);
  const [endYear, setEndYear] = useState(initialEndYear);
  const [selectedCountries, setSelectedCountries] = useState<string[]>(() => {
    if (initialCountries === "All") {
      return COUNTRIES.map((c) => c.code);
    }
    return initialCountries.split(",");
  });

  // Set initial height - using useLayoutEffect to measure before paint
  useIsomorphicLayoutEffect(() => {
    if (!sticky || !filterRef.current) return;
    // Set initial height synchronously to avoid layout shift
    const height = filterRef.current.offsetHeight;
    setPlaceholderHeight(height);
  }, [sticky]);

  // Function to handle scroll events
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
  const resetState = () => {
    setStartYear(initialStartYear);
    setEndYear(initialEndYear);
    setSelectedCountries(
      initialCountries === "All"
        ? COUNTRIES.map((c) => c.code)
        : initialCountries.split(",")
    );
  };

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
    resetState();
  };

  // Apply filters and update URL
  const applyFilters = () => {
    const countriesParam =
      selectedCountries.length === COUNTRIES.length
        ? "All"
        : selectedCountries.join(",");

    // Update URL params
    const params = new URLSearchParams();
    params.set("startYear", startYear.toString());
    params.set("endYear", endYear.toString());
    params.set("countries", countriesParam);

    // Update the URL without refreshing the page
    router.push(`?${params.toString()}`, { scroll: false });

    // Collapse the filter panel after applying
    setExpanded(false);
  };

  // Reset filters to defaults
  const resetFilters = () => {
    // Reset URL to default values or clear params
    router.push("/", { scroll: false });
    toggleExpanded();
  };

  // Render the filter component
  const filterComponent = (
    <Paper
      ref={filterRef}
      elevation={isSticky ? 4 : 2}
      sx={{
        mb: 4,
        transition: "all 0.15s ease-out",
        position: isSticky ? "fixed" : "relative",
        top: isSticky ? 0 : "auto",
        left: isSticky ? 0 : "auto",
        right: isSticky ? 0 : "auto",
        zIndex: isSticky ? 1100 : 1,
        width: isSticky ? "100%" : "auto",
        borderRadius: isSticky ? 0 : 1,
        maxWidth: isSticky ? "none" : "100%",
        transform: isSticky ? "translateZ(0)" : "none",
        willChange: sticky ? "position, top" : "auto",
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
          transition: "height 0.15s ease-out",
        }}
      />

      {/* Actual filter component */}
      {filterComponent}
    </>
  );
};

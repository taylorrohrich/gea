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
  useScrollTrigger,
  Slide,
  Fade,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import FilterListIcon from "@mui/icons-material/FilterList";
import { DateRangeSelector } from "./DateRangeSelector";
import { CountrySelector, COUNTRIES } from "./CountrySelector";
import { useRouter, useSearchParams } from "next/navigation";

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

  // Function to handle scroll events
  useEffect(() => {
    if (!sticky) return;

    const handleScroll = () => {
      if (!placeholderRef.current) return;

      const placeholderPos = placeholderRef.current.getBoundingClientRect();
      const shouldBeSticky = placeholderPos.top <= 0;

      if (shouldBeSticky !== isSticky) {
        setIsSticky(shouldBeSticky);
      }
    };

    // Set initial height
    if (filterRef.current) {
      setPlaceholderHeight(filterRef.current.offsetHeight);
    }

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isSticky, sticky]);

  // Extract and parse query parameters
  const queryStartYear = searchParams.get("startYear")
    ? parseInt(searchParams.get("startYear")!, 10)
    : defaultStartYear;

  const queryEndYear = searchParams.get("endYear")
    ? parseInt(searchParams.get("endYear")!, 10)
    : defaultEndYear;

  const queryCountries = searchParams.get("countries") || defaultCountries;

  // Local state for filters
  const [startYear, setStartYear] = React.useState(queryStartYear);
  const [endYear, setEndYear] = React.useState(queryEndYear);
  const [selectedCountries, setSelectedCountries] = React.useState<string[]>(
    () => {
      if (queryCountries === "All") {
        return COUNTRIES.map((c) => c.code);
      }
      return queryCountries.split(",");
    }
  );

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

    // Create query parameters
    const params = new URLSearchParams();
    params.set("startYear", startYear.toString());
    params.set("endYear", endYear.toString());
    params.set("countries", countriesParam);

    // Update the URL without refreshing the page
    router.push(`?${params.toString()}`, { scroll: false });

    // Call the provided callback if it exists
    if (onApplyFilters) {
      onApplyFilters({
        startYear,
        endYear,
        countries: countriesParam === "All" ? "All" : selectedCountries,
      });
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
        transition: "all 0.3s ease-in-out",
        position: isSticky ? "fixed" : "relative",
        top: isSticky ? 0 : "auto",
        left: isSticky ? 0 : "auto",
        right: isSticky ? 0 : "auto",
        zIndex: isSticky ? 1100 : 1,
        width: isSticky ? "100%" : "auto",
        borderRadius: isSticky ? 0 : 1,
        maxWidth: isSticky ? "none" : "100%",
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
        }}
      />

      {/* Actual filter component */}
      <Fade in={true}>{filterComponent}</Fade>
    </>
  );
};

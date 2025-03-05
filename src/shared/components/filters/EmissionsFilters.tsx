"use client";
import React, { useState, useEffect } from "react";
import { Button, Divider, IconButton, Chip } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import FilterListIcon from "@mui/icons-material/FilterList";
import { DateRangeSelector } from "./DateRangeSelector";
import { CountrySelector, COUNTRIES } from "./CountrySelector";
import { useRouter } from "next/navigation";

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

  // Local state for filters - initialized from props
  const [startYear, setStartYear] = useState(initialStartYear);
  const [endYear, setEndYear] = useState(initialEndYear);
  const [selectedCountries, setSelectedCountries] = useState<string[]>(() => {
    if (initialCountries === "All") {
      return COUNTRIES.map((c) => c.code);
    }
    return initialCountries.split(",");
  });

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
    toggleExpanded();

    // // Reset URL to default values or clear params
    router.push("/", { scroll: false });
  };

  // Define sticky classes conditionally
  const containerClasses = sticky
    ? "mb-4 relative md:sticky md:top-0 md:z-50 transition-shadow duration-200 ease-out"
    : "mb-4 relative";

  const paperClasses =
    sticky && expanded
      ? "bg-white rounded shadow-md transition-shadow duration-200"
      : "bg-white rounded shadow";

  const headerClasses = sticky
    ? "p-4 flex justify-between items-center cursor-pointer bg-white border-b border-gray-200"
    : "p-4 flex justify-between items-center cursor-pointer";

  return (
    <div className={containerClasses}>
      <div className={paperClasses}>
        {/* Header - Always visible */}
        <div className={headerClasses} onClick={toggleExpanded}>
          <div className="flex items-center gap-2">
            <FilterListIcon color="primary" />
            <h6 className="text-lg font-medium">Emissions Data Filters</h6>
          </div>

          {/* Summary when collapsed */}
          {!expanded && (
            <div className="flex items-center gap-2 flex-1 mx-2 overflow-hidden">
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
                <div className="flex gap-1 overflow-auto flex-nowrap">
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
                </div>
              )}
            </div>
          )}

          <IconButton
            aria-label={expanded ? "collapse" : "expand"}
            className="ml-auto"
          >
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </div>

        <Divider />

        {/* Collapsible content */}
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            expanded ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="p-4">
            <DateRangeSelector
              startYear={startYear}
              endYear={endYear}
              onRangeChange={handleRangeChange}
            />

            <Divider className="my-4" />

            <CountrySelector
              selectedCountries={selectedCountries}
              onSelectionChange={handleCountryChange}
            />

            <Divider className="my-4" />

            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="outlined"
                color="secondary"
                onClick={resetFilters}
              >
                Reset
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={applyFilters}
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

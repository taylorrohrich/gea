"use client";
import React, { useState } from "react";
import { Button, Divider, IconButton, Chip } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import FilterListIcon from "@mui/icons-material/FilterList";
import { DateRangeSelector } from "./DateRangeSelector";
import { CountrySelector } from "./CountrySelector";
import { useRouter } from "next/navigation";
import { CountryCode } from "@/shared/types/countries";
import { COUNTRY_CODES_MAP, COUNTRY_COUNT } from "@/shared/constants/countries";

interface Props {
  startYear: number;
  endYear: number;
  countries: CountryCode[];
}

export function EmissionsFilters({
  startYear: initialStartYear,
  endYear: initialEndYear,
  countries: initialCountries,
}: Props) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  // Local state for filters - initialized from props
  const [startYear, setStartYear] = useState(initialStartYear);
  const [endYear, setEndYear] = useState(initialEndYear);
  const [selectedCountries, setSelectedCountries] =
    useState<CountryCode[]>(initialCountries);

  // Reset state to initial values
  const resetState = () => {
    setStartYear(initialStartYear);
    setEndYear(initialEndYear);
    setSelectedCountries(initialCountries);
  };

  // Handle date range changes
  const handleRangeChange = (newStartYear: number, newEndYear: number) => {
    setStartYear(newStartYear);
    setEndYear(newEndYear);
  };

  // Handle country selection changes
  const handleCountryChange = (selected: CountryCode[]) => {
    setSelectedCountries(selected);
  };

  // Toggle expanded state
  const toggleExpanded = () => {
    setExpanded(!expanded);
    resetState();
  };

  // Apply filters and update URL
  const applyFilters = () => {
    const countriesParam = selectedCountries.join(",");

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

    // Reset URL to default values or clear params
    router.push("/", { scroll: false });
  };

  return (
    <div className="mb-4 relative">
      <div className="bg-white rounded shadow">
        <div
          className="p-4 flex justify-between items-center cursor-pointer gap-4"
          onClick={toggleExpanded}
        >
          <div className="flex items-center gap-2">
            <FilterListIcon color="primary" />
            <h6 className="text-lg font-medium">Filters</h6>
          </div>
          {!expanded && (
            <div className="flex items-center gap-4 flex-1 overflow-hidden">
              <Chip
                label={`Year Range: ${startYear}-${endYear}`}
                size="small"
                color="primary"
                variant="outlined"
              />
              {selectedCountries.length === COUNTRY_COUNT ? (
                <Chip
                  label="All Countries"
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              ) : (
                <div className="flex gap-1 overflow-auto flex-wrap">
                  {selectedCountries.map((code) => {
                    const country = COUNTRY_CODES_MAP[code];
                    return (
                      <Chip
                        key={code}
                        label={country}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    );
                  })}
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
}

import React, { useEffect } from "react";
import { Box, Paper, Button, Typography, Divider } from "@mui/material";
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
}

export const EmissionsFilters: React.FC<EmissionsFiltersProps> = ({
  defaultStartYear = 1972,
  defaultEndYear = 2022,
  defaultCountries = "All",
  onApplyFilters,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

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
    router.push(`?${params.toString()}`);

    // Call the provided callback if it exists
    if (onApplyFilters) {
      onApplyFilters({
        startYear,
        endYear,
        countries: countriesParam === "All" ? "All" : selectedCountries,
      });
    }
  };

  // Reset filters to defaults
  const resetFilters = () => {
    setStartYear(defaultStartYear);
    setEndYear(defaultEndYear);
    setSelectedCountries(COUNTRIES.map((c) => c.code));
  };

  return (
    <Paper elevation={2} sx={{ mb: 4 }}>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Emissions Data Filters
        </Typography>

        <Divider sx={{ mb: 2 }} />

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
    </Paper>
  );
};

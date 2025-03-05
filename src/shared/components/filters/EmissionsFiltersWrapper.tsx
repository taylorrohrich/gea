"use client";

import React from "react";
import { EmissionsFilters } from "./EmissionsFilters";
import { useRouter } from "next/navigation";

interface EmissionsFiltersWrapperProps {
  startYear: number;
  endYear: number;
  countries: string;
  sticky?: boolean;
}

export const EmissionsFiltersWrapper: React.FC<
  EmissionsFiltersWrapperProps
> = ({ startYear, endYear, countries, sticky = true }) => {
  const router = useRouter();

  // Handle filter application
  const handleApplyFilters = (filters: {
    startYear: number;
    endYear: number;
    countries: string[] | "All";
  }) => {
    // Create the URL parameters
    const params = new URLSearchParams();
    params.set("startYear", filters.startYear.toString());
    params.set("endYear", filters.endYear.toString());

    if (filters.countries === "All") {
      params.set("countries", "All");
    } else {
      params.set("countries", filters.countries.join(","));
    }

    // Update the URL without refreshing the page or scrolling to top
    router.push(`/?${params.toString()}`, { scroll: false });
  };

  return (
    <EmissionsFilters
      startYear={startYear}
      endYear={endYear}
      countries={countries}
      onApplyFilters={handleApplyFilters}
      sticky={sticky}
    />
  );
};

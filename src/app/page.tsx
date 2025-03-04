import { getEmissionsData } from "@/shared/actions/emissions";
import { Grid } from "@/shared/components/grid";
import { EmissionsFiltersWrapper } from "@/shared/components/filters/EmissionsFiltersWrapper";
import { Suspense } from "react";
import { Container, Box } from "@mui/material";

// This function gets search params in a server component
function getSearchParams(searchParams: {
  [key: string]: string | string[] | undefined;
}) {
  const startYear = searchParams.startYear
    ? parseInt(searchParams.startYear as string, 10)
    : 1972;

  const endYear = searchParams.endYear
    ? parseInt(searchParams.endYear as string, 10)
    : 2022;

  const countries = searchParams.countries
    ? (searchParams.countries as string)
    : "All";

  return { startYear, endYear, countries };
}

export default async function Home({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // Extract filter parameters from URL
  const { startYear, endYear, countries } = getSearchParams(searchParams);

  // Parse countries for data fetching
  const countriesParam = countries === "All" ? "All" : countries.split(",");

  // Fetch data based on filters
  const data = getEmissionsData({
    startYear,
    endYear,
    countries: countriesParam,
  });

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <h1 className="text-2xl font-bold mb-6">
          Greenhouse Gas Emissions Dashboard
        </h1>

        {/* Filters - server side rendered but with client interactivity */}
        <EmissionsFiltersWrapper
          defaultStartYear={startYear}
          defaultEndYear={endYear}
          defaultCountries={countries}
        />
      </Box>

      {/* Grid with data */}
      <Box sx={{ height: "calc(100vh - 300px)", minHeight: "500px" }}>
        <Suspense
          fallback={
            <div className="flex justify-center items-center h-full">
              Loading chart data...
            </div>
          }
        >
          <Grid data={data} />
        </Suspense>
      </Box>
    </Container>
  );
}

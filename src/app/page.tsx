import { getEmissionsData } from "@/shared/actions/emissions";
import { Grid } from "@/shared/components/grid";
import { Suspense } from "react";
import { Container, Box } from "@mui/material";
import { EmissionsFilters } from "@/shared/components/filters/EmissionsFilters";

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
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Extract filter parameters from URL
  const { startYear, endYear, countries } = getSearchParams(await searchParams);

  // Parse countries for data fetching
  const countriesParam = countries === "All" ? "All" : countries.split(",");
  const startYearParam = startYear ? Number(startYear) : 1972;
  const endYearParam = endYear ? Number(endYear) : 2022;

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
        <EmissionsFilters
          startYear={startYearParam}
          endYear={endYearParam}
          countries={countries}
          sticky
        />
      </Box>

      {/* Grid with data - more top margin when filters are collapsed */}
      <Box sx={{ height: "calc(100vh - 250px)", minHeight: "500px" }}>
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

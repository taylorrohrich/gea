import { getEmissionsData } from "@/shared/actions/emissions";
import { Grid } from "@/shared/components/grid";
import { Suspense } from "react";
import { Container, Box } from "@mui/material";
import { EmissionsFilters } from "@/shared/components/filters/EmissionsFilters";
import { CountryCode } from "@/shared/types/countries";

interface SearchParams {
  startYear: string;
  endYear: string;
  countries: string;
}

function getSearchParams(searchParams: Partial<SearchParams>) {
  const startYear = searchParams.startYear
    ? parseInt(searchParams.startYear as string, 10)
    : 1972;

  const endYear = searchParams.endYear
    ? parseInt(searchParams.endYear as string, 10)
    : 2022;
  let countries: CountryCode[] = [];
  if (searchParams.countries === "All" || !searchParams.countries) {
    countries = Object.values(CountryCode);
  } else {
    countries = searchParams.countries.split(",") as CountryCode[];
  }
  return { startYear, endYear, countries };
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Partial<SearchParams>>;
}) {
  // Extract filter parameters from URL
  const { startYear, endYear, countries } = getSearchParams(await searchParams);

  // Fetch data based on filters
  const data = getEmissionsData({
    startYear,
    endYear,
    countries,
  });

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <h1 className="text-2xl font-bold mb-6">
          Greenhouse Gas Emissions Dashboard
        </h1>
        <EmissionsFilters
          startYear={startYear}
          endYear={endYear}
          countries={countries}
        />
      </Box>
      <Suspense
        fallback={
          <div className="flex justify-center items-center h-full">
            Loading chart data...
          </div>
        }
      >
        <Grid data={data} />
      </Suspense>
    </Container>
  );
}

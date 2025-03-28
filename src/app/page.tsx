import { getEmissionsData } from "@/shared/actions/emissions";
import { Grid } from "@/shared/components/Grid";
import { Suspense } from "react";
import { CircularProgress } from "@mui/material";
import { EmissionsFilters } from "@/shared/components/Filters/EmissionsFilters";
import { CountryCode } from "@/shared/types/countries";
import { GridProvider } from "@/shared/components/Grid/GridContext";

interface SearchParams {
  startYear: string;
  endYear: string;
  countries: string;
}

function getSearchParams(searchParams: Partial<SearchParams>) {
  // convert to numbers or set defaults
  const startYear = searchParams.startYear
    ? parseInt(searchParams.startYear as string, 10)
    : 1972;

  const endYear = searchParams.endYear
    ? parseInt(searchParams.endYear as string, 10)
    : 2022;
  // if country key not defined; default to all countries
  let countries: CountryCode[] = [];
  if (!("countries" in searchParams)) {
    countries = Object.values(CountryCode);
  } else if (searchParams.countries) {
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
    <div className="container mx-auto py-16 flex gap-4 flex-col">
      <h1 className="text-2xl font-bold">Global Emissions Analytics</h1>
      <EmissionsFilters
        //reset state on change
        key={`${startYear}-${endYear}-${countries.join(",")}`}
        startYear={startYear}
        endYear={endYear}
        countries={countries}
      />
      <Suspense
        fallback={
          <div className="flex justify-center items-center h-[500px]">
            <CircularProgress />
          </div>
        }
      >
        <GridProvider data={data}>
          <Grid />
        </GridProvider>
      </Suspense>
    </div>
  );
}

import { getEmissionsData } from "@/shared/actions/emissions";
import { Grid } from "@/shared/components/grid";
import { Suspense } from "react";
export default async function Home() {
  const data = getEmissionsData({
    startYear: 1972,
    endYear: 2022,
    countries: "All",
  });
  return (
    <div>
      <main>
        <Suspense fallback={<div>Loading...</div>}>
          <Grid data={data} />
        </Suspense>
      </main>
    </div>
  );
}

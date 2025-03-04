import { getEmissionsData } from "@/shared/actions/emissions";
import { Grid } from "@/shared/components/grid";
export default async function Home() {
  const data = await getEmissionsData({
    startYear: 1972,
    endYear: 2022,
    countries: "All",
  });
  console.log(data);
  return (
    <div>
      <main>
        <Grid />
      </main>
    </div>
  );
}

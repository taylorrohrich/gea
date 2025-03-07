import { WorldBankDataPoint, WorldBankMetadata } from "./types";

const INDICATOR = "EN.GHG.ALL.MT.CE.AR5";

export async function fetchEmissionsData(
  countryCode: string,
  startYear: number,
  endYear: number
): Promise<WorldBankDataPoint[]> {
  const baseUrl = `https://api.worldbank.org/v2/country/${countryCode}/indicator/${INDICATOR}`;
  let allData: WorldBankDataPoint[] = [];
  let currentPage = 1;
  let totalPages = 1;

  // Handle pagination by fetching all pages
  do {
    const url = new URL(baseUrl);
    url.search = new URLSearchParams({
      format: "json",
      date: `${startYear}:${endYear}`,
      page: currentPage.toString(),
      per_page: "100",
    }).toString();

    try {
      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }

      const [metadata, data] = (await response.json()) as [
        WorldBankMetadata,
        WorldBankDataPoint[]
      ];

      if (!data || data.length === 0) {
        break;
      }

      allData = [...allData, ...data];
      totalPages = metadata.pages;
      currentPage++;
    } catch (error) {
      console.error("Error fetching World Bank emissions data:", error);
      break;
    }
  } while (currentPage <= totalPages);

  return allData.sort((a, b) => parseInt(a.date) - parseInt(b.date));
}

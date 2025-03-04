import { cache } from "react";

// Define country codes
export const COUNTRY_CODES = {
  USA: { code: "USA", name: "United States" },
  JPN: { code: "JPN", name: "Japan" },
  CHN: { code: "CHN", name: "China" },
  IND: { code: "IND", name: "India" },
  FRA: { code: "FRA", name: "France" },
  BRA: { code: "BRA", name: "Brazil" },
};

export type CountryCode = keyof typeof COUNTRY_CODES;

// Define the response types from World Bank API
interface WorldBankMetadata {
  page: number;
  pages: number;
  per_page: number;
  total: number;
  sourceid: string;
  lastupdated: string;
}

interface WorldBankIndicator {
  id: string;
  value: string;
}

interface WorldBankCountry {
  id: string;
  value: string;
}

export interface WorldBankDataPoint {
  indicator: WorldBankIndicator;
  country: WorldBankCountry;
  countryiso3code: string;
  date: string;
  value: number;
  unit: string;
  obs_status: string;
  decimal: number;
}

export interface WorldBankResponse {
  metadata: WorldBankMetadata;
  data: WorldBankDataPoint[];
}

// Define our transformed data structure
export interface ProcessedDataPoint {
  x: string; // date
  y: number; // value
}

export interface CountryData {
  country: string;
  countryCode: string;
  values: ProcessedDataPoint[];
}

// Cache to store fetched data
const dataCache: Record<string, WorldBankDataPoint[]> = {};

/**
 * Fetches emissions data for a specific country within a date range
 */
export async function fetchEmissionsData(
  countryCode: string,
  startYear: number,
  endYear: number
): Promise<WorldBankDataPoint[]> {
  // Create a cache key
  const cacheKey = `${countryCode}-${startYear}-${endYear}`;

  // Check if data is already cached
  if (dataCache[cacheKey]) {
    return dataCache[cacheKey];
  }

  // Emissions indicator: EN.GHG.ALL.MT.CE.AR5 - Total greenhouse gas emissions excluding LULUCF
  const indicator = "EN.GHG.ALL.MT.CE.AR5";
  const baseUrl = `https://api.worldbank.org/v2/country/${countryCode}/indicator/${indicator}`;

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

  // Filter out entries with no values and sort by date
  const filteredData = allData
    .filter((item) => item.value !== null)
    .sort((a, b) => parseInt(a.date) - parseInt(b.date));

  // Store in cache
  dataCache[cacheKey] = filteredData;

  return filteredData;
}

/**
 * Process data for multiple countries
 */
export async function processEmissionsData(
  countryCodes: string[],
  startYear: number,
  endYear: number
): Promise<CountryData[]> {
  // Fetch data for each country in parallel
  const promises = countryCodes.map((countryCode) =>
    fetchEmissionsData(countryCode, startYear, endYear)
  );

  const countriesData = await Promise.all(promises);

  // Process the data into the desired format
  return countryCodes.map((code, index) => {
    const countryData = countriesData[index];
    const countryName = countryData[0]?.country.value || code;

    return {
      country: countryName,
      countryCode: code,
      values: countryData.map((item) => ({
        x: item.date,
        y: item.value,
      })),
    };
  });
}

// Create a cached version of the data processor
export const getCachedEmissionsData = cache(processEmissionsData);

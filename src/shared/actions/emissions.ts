"use server";

import { cache } from "react";
import { fetchEmissionsData } from "../api/worldbank";
import { Data, Point } from "../types/data";
import { CountryCode } from "../types/countries";
import { COUNTRY_CODES_MAP } from "../constants/countries";

// Define acceptable parameters
export interface GetEmissionsParams {
  startYear: number;
  endYear: number;
  countries: CountryCode[];
}

// Cache to store fetched data across requests
const dataCache: Record<string, Data[]> = {};

/**
 * Server Action to fetch emissions data
 * This function can be called directly from client components
 */
export async function getEmissionsData({
  startYear,
  endYear,
  countries,
}: GetEmissionsParams): Promise<Data[]> {
  try {
    const invalidCodes = countries.filter(
      (code) => !Object.keys(COUNTRY_CODES_MAP).includes(code)
    );

    if (invalidCodes.length > 0) {
      throw new Error(`Invalid country codes: ${invalidCodes.join(", ")}`);
    }
    // Generate cache key
    const cacheKey = `${startYear}-${endYear}-${countries.sort().join(",")}`;

    // Check if we have cached data
    if (dataCache[cacheKey]) {
      return dataCache[cacheKey];
    }

    // Fetch data for each country in parallel
    const promises = countries.map((countryCode) =>
      fetchEmissionsData(countryCode, startYear, endYear)
    );

    const countriesRawData = await Promise.all(promises);

    // Transform the data into our desired format
    const processedData: Data[] = countries.map((code, index) => {
      const countryData = countriesRawData[index];

      // Handle empty data case
      if (!countryData || countryData.length === 0) {
        return {
          label: COUNTRY_CODES_MAP[code] ?? code,
          values: [],
        };
      }

      const countryName =
        countryData[0]?.country?.value ?? COUNTRY_CODES_MAP[code] ?? code;

      const values: Point[] = countryData
        .filter((item) => item.value !== null && item.value !== undefined)
        .map((item) => ({
          x: item.date,
          y: item.value,
        }));

      return {
        label: countryName,
        values,
      };
    });

    // Store in our cache
    dataCache[cacheKey] = processedData;

    return processedData;
  } catch (error) {
    console.error("Error processing emissions data request:", error);
    // Return empty array instead of throwing to handle gracefully
    return [];
  }
}

// Create a cached version of the action for use within server components
export const getCachedEmissionsData = cache(getEmissionsData);

"use server";

import { cache } from "react";
import { COUNTRY_CODES, fetchEmissionsData } from "../api/worldbank";
import { Data, Point } from "../types/data";

// Define acceptable parameters
export interface GetEmissionsParams {
  startYear?: number;
  endYear?: number;
  countries?: string[] | "All";
}

// Cache to store fetched data across requests
const dataCache: Record<string, Data[]> = {};

/**
 * Server Action to fetch emissions data
 * This function can be called directly from client components
 */
export async function getEmissionsData({
  startYear = 1972,
  endYear = 2022,
  countries = "All",
}: GetEmissionsParams): Promise<Data[]> {
  try {
    // Determine which country codes to use
    let countryCodes: string[];
    if (countries === "All") {
      countryCodes = Object.keys(COUNTRY_CODES);
    } else {
      countryCodes = Array.isArray(countries) ? countries : [countries];

      // Validate country codes
      const invalidCodes = countryCodes.filter(
        (code) => !Object.keys(COUNTRY_CODES).includes(code)
      );

      if (invalidCodes.length > 0) {
        throw new Error(`Invalid country codes: ${invalidCodes.join(", ")}`);
      }
    }

    // Generate cache key
    const cacheKey = `${startYear}-${endYear}-${countryCodes.sort().join(",")}`;

    // Check if we have cached data
    if (dataCache[cacheKey]) {
      return dataCache[cacheKey];
    }

    // Fetch data for each country in parallel
    const promises = countryCodes.map((countryCode) =>
      fetchEmissionsData(countryCode, startYear, endYear)
    );

    const countriesRawData = await Promise.all(promises);

    // Transform the data into our desired format
    const processedData: Data[] = countryCodes.map((code, index) => {
      const countryData = countriesRawData[index];

      // Handle empty data case
      if (!countryData || countryData.length === 0) {
        return {
          label:
            COUNTRY_CODES[code as keyof typeof COUNTRY_CODES]?.name || code,
          values: [],
        };
      }

      const countryName =
        countryData[0]?.country?.value ||
        COUNTRY_CODES[code as keyof typeof COUNTRY_CODES]?.name ||
        code;

      // Transform to Point array and filter out nulls
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

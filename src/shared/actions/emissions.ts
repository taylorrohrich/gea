"use server";

import { cache } from "react";
import { COUNTRY_CODES, fetchEmissionsData } from "../api/worldbank";
import { Data } from "../types/data";

// Define acceptable parameters
export interface GetEmissionsParams {
  startYear?: number;
  endYear?: number;
  countries?: string[] | "All";
}

// Cache to store fetched data across requests
const dataCache: Record<string, any> = {};

/**
 * Server Action to fetch emissions data
 * This function can be called directly from client components
 */
export async function getEmissionsData({
  startYear = 1972,
  endYear = 2022,
  countries = "All",
}: GetEmissionsParams): Promise<{ data: Data[] }> {
  try {
    // Determine which country codes to use
    let countryCodes: string[];
    if (countries === "All") {
      countryCodes = Object.keys(COUNTRY_CODES);
    } else {
      countryCodes = countries;

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
      return { data: dataCache[cacheKey] };
    }

    // Fetch data for each country in parallel
    const promises = countryCodes.map((countryCode) =>
      fetchEmissionsData(countryCode, startYear, endYear)
    );

    const countriesRawData = await Promise.all(promises);

    // Transform the data into our desired format
    const processedData: Data[] = countryCodes.map((code, index) => {
      const countryData = countriesRawData[index];
      const countryName =
        countryData[0]?.country.value ||
        COUNTRY_CODES[code as keyof typeof COUNTRY_CODES]?.name ||
        code;

      return {
        label: countryName,
        values: countryData.map((item) => ({
          x: item.date,
          y: item.value,
        })),
      };
    });

    // Store in our cache
    dataCache[cacheKey] = processedData;

    return { data: processedData };
  } catch (error) {
    console.error("Error processing emissions data request:", error);
    throw error;
  }
}

// Create a cached version of the action for use within server components
export const getCachedEmissionsData = cache(getEmissionsData);

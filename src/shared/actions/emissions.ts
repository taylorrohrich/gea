"use server";

import { cache } from "react";
import { fetchEmissionsData } from "../api/worldbank";
import { Data, Point } from "../types/data";
import { CountryCode } from "../types/countries";
import { COUNTRY_CODES_MAP } from "../constants/countries";

export interface GetEmissionsParams {
  startYear: number;
  endYear: number;
  countries: CountryCode[];
}

// Cache to store emissions data
const dataCache: Record<string, Data[]> = {};

/**
 * Fetches emissions data for the specified countries and years.
 *
 * @param body - An object containing the start year, end year, and an array of country codes.
 * @returns A promise that resolves to an array of data by country.
 */
export async function getEmissionsData({
  startYear,
  endYear,
  countries,
}: GetEmissionsParams): Promise<Data[]> {
  try {
    // make sure we aren't passing invalid country codes
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
    const countriesRawData = await Promise.all(
      countries.map((countryCode) =>
        fetchEmissionsData(countryCode, startYear, endYear)
      )
    );

    // Transform the data into our desired format
    const processedData: Data[] = countries.map((code, index) => {
      const countryData = countriesRawData[index];

      // Handle empty data case
      if (!countryData || countryData.length === 0) {
        return {
          id: code,
          label: COUNTRY_CODES_MAP[code] ?? code,
          values: [],
        };
      }

      const countryName =
        countryData[0]?.country?.value ?? COUNTRY_CODES_MAP[code] ?? code;

      // Generate points
      const values: Point[] = countryData.map((item) => ({
        x: item.date,
        y: item.value,
      }));

      return {
        id: code,
        label: countryName,
        values,
      };
    });

    // Store in our cache before returning
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

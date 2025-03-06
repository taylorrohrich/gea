import { CountryCode } from "../types/countries";

export const COUNTRY_CODES_MAP: Record<CountryCode, string> = {
  [CountryCode.USA]: "United States",
  [CountryCode.JPN]: "Japan",
  [CountryCode.CHN]: "China",
  [CountryCode.IND]: "India",
  [CountryCode.FRA]: "France",
  [CountryCode.BRA]: "Brazil",
};

export const COUNTRY_COUNT = Object.keys(COUNTRY_CODES_MAP).length;

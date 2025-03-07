import { CountryCode } from "@/shared/types/countries";

export const COUNTRY_COLORS_MAP: Record<CountryCode, string> = {
  [CountryCode.USA]: "#8884d8",
  [CountryCode.JPN]: "#82ca9d",
  [CountryCode.CHN]: "#ffc658",
  [CountryCode.IND]: "#ff8042",
  [CountryCode.FRA]: "#0088FE",
  [CountryCode.BRA]: "#FF5733",
};

export const CHART_Y_AXIS_LABEL = "Mt CO2e";

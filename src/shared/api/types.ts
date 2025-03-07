// these types outline the structure of the data that we will be fetching from the World Bank API
export interface WorldBankMetadata {
  page: number;
  pages: number;
  per_page: number;
  total: number;
  sourceid: string;
  lastupdated: string;
}

interface KeyValue {
  id: string;
  value: string;
}

export interface WorldBankDataPoint {
  indicator: KeyValue;
  country: KeyValue;
  countryiso3code: string;
  date: string;
  value: number;
  unit: string;
  obs_status: string;
  decimal: number;
}

export interface CountryData {
  country: string;
  countryCode: string;
  values: {
    x: string;
    y: number;
  }[];
}

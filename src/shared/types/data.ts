import { CountryCode } from "./countries";

export interface Point {
  x: string;
  y: number;
}

export interface Data {
  id: CountryCode;
  label: string;
  values: Point[];
}

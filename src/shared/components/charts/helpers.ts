import { Data } from "@/shared/types/data";

export function transformData(data: Data[]) {
  // If no data, return empty array
  if (!data || data.length === 0) {
    return [];
  }
  // Get all x values from all data series
  const allXValues = new Set<string>();
  data.forEach((series) => {
    series.values.forEach((point) => {
      allXValues.add(point.x);
    });
  });

  // Sort x values
  const sortedXValues = Array.from(allXValues).sort();

  // Create a data point for each x value with values for each series
  return sortedXValues.map((x) => {
    const dataPoint: Record<string, number | string | null> = { x };

    // Add each series' value for this x
    data.forEach((series) => {
      const point = series.values.find((p) => p.x === x);
      dataPoint[series.label] = point ? point.y : null;
    });

    return dataPoint;
  });
}

export function transformAggregateData(data: Data[]) {
  // If no data, return empty array
  if (!data || data.length === 0) {
    return [];
  }
  return data.map((series) => {
    const totalValue = series.values.reduce((sum, point) => sum + point.y, 0);

    return {
      name: series.label,
      value: totalValue,
    };
  });
}

import { Data } from "@/shared/types/data";

// transform data for line, bar charts
export function transformData(data: Data[]) {
  // If no data, return empty array
  if (!data || data.length === 0) {
    return [];
  }

  // Create a map to organize data by x value
  const rowsMap = new Map<string, Record<string, number | string>>();

  // Populate the map with all data points
  data.forEach((series) => {
    series.values.forEach((point) => {
      if (!rowsMap.has(point.x)) {
        rowsMap.set(point.x, { x: point.x });
      }
      // Add this series' value to the row data
      rowsMap.get(point.x)![series.label] = point.y;
    });
  });

  // Get all x values from all data series
  const allXValues = new Set<string>();
  data.forEach((series) => {
    series.values.forEach((point) => {
      allXValues.add(point.x);
    });
  });
  return Array.from(rowsMap.values()).sort((a, b) =>
    String(a.x).localeCompare(String(b.x))
  );
}

// transform + aggregate data for map, pie chart
export function transformAggregateData(data: Data[]) {
  // If no data, return empty array
  if (!data || data.length === 0) {
    return [];
  }
  // Aggregate data by series
  return data.map((series) => {
    const totalValue = series.values.reduce((sum, point) => sum + point.y, 0);

    return {
      name: series.label,
      value: totalValue,
    };
  });
}

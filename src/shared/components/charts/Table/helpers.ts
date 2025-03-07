import { GridColDef } from "@mui/x-data-grid";
import { Chart } from "@/shared/types/chart";
import { Data } from "@/shared/types/data";

// if we should aggregate the data for the table
export function shouldShowAggregatedData(chartType: Chart): boolean {
  return [Chart.Pie, Chart.Map].includes(chartType);
}

// Columns for aggregation table
const aggregationColumns: GridColDef[] = [
  {
    field: "label",
    headerName: "Label",
    minWidth: 150,
    flex: 1,
  },
  {
    field: "value",
    headerName: "Value",
    type: "number",
    flex: 1,
  },
  {
    field: "percentage",
    headerName: "Percentage",
    type: "number",
    flex: 1,
  },
];

// Creates aggregated tabular data
export function createAggregatedGridData(data: Data[]) {
  // Calculate total for percentage calculation
  const total = data.reduce((sum, series) => {
    const seriesSum = series.values.reduce((acc, point) => acc + point.y, 0);
    return sum + seriesSum;
  }, 0);

  // Create rows with id and formatted data
  const rows = data.map((series, index) => {
    const value = series.values.reduce((sum, point) => sum + point.y, 0);
    const percentage =
      total > 0 ? Number(((value / total) * 100).toFixed(1)) : 0;

    return {
      id: index,
      label: series.label,
      value,
      percentage,
    };
  });

  // Define columns

  return { rows, columns: aggregationColumns };
}

// Creates time series tabular data
export function createTimeSeriesGridData(data: Data[]) {
  // Get all x values from all series
  const allXValues = new Set<string>();
  data.forEach((series) => {
    series.values.forEach((point) => {
      allXValues.add(point.x);
    });
  });

  // Create a map to hold all data points by x value
  const rowsMap = new Map<string, Record<string, unknown>>();

  // Initialize map with x values and ids
  Array.from(allXValues).forEach((x, index) => {
    rowsMap.set(x, { id: index, x });
  });

  // Fill in values for each series
  data.forEach((series) => {
    series.values.forEach((point) => {
      const row = rowsMap.get(point.x);
      if (row) {
        row[series.label] = point.y;
      }
    });
  });

  // Convert map to array of rows
  const rows = Array.from(rowsMap.values());

  // Define columns
  const columns: GridColDef[] = [
    {
      field: "x",
      headerName: "Year/Period",
      minWidth: 150,
      flex: 1,
    },
  ];

  // Add a column for each data series
  data.forEach((series) => {
    columns.push({
      field: series.label,
      headerName: series.label,
      type: "number",
      flex: 1,
    });
  });

  return { rows, columns };
}

// Prepares the table data based on the chart type
export function prepareTableData(data: Data[], chartType: Chart) {
  if (!data || data.length === 0) {
    return { rows: [], columns: [] };
  }

  // For Pie and Map charts, show aggregated data
  if (shouldShowAggregatedData(chartType)) {
    return createAggregatedGridData(data);
  }

  // For all other charts, use time series format
  return createTimeSeriesGridData(data);
}

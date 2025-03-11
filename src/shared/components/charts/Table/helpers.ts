import { GridColDef } from "@mui/x-data-grid";
import { Chart } from "@/shared/types/chart";
import { Data } from "@/shared/types/data";
import { transformAggregateData, transformData } from "../helpers";
import { sumBy } from "lodash";

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
  const aggData = transformAggregateData(data);
  // Calculate total for percentage calculation
  const total = sumBy(aggData, "value");
  const rows = aggData.map((series, index) => {
    const percentage =
      total > 0 ? Number(((series.value / total) * 100).toFixed(1)) : 0;
    return {
      id: index,
      label: series.name,
      value: series.value,
      percentage,
    };
  });

  // Define columns

  return { rows, columns: aggregationColumns };
}

// Creates time series tabular data
export function createTimeSeriesGridData(data: Data[]) {
  // Get all x values from all series
  const rows = transformData(data).map((row, index) => ({ id: index, ...row }));

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

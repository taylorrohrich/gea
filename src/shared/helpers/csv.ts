import { createAggregatedGridData } from "../components/charts/Table/helpers";
import { Chart } from "../types/chart";
import { Data } from "../types/data";

function buildAggregatedCSVRows(data: Data[]) {
  return createAggregatedGridData(data).rows.map(
    ({ label, value, percentage }) => [label, value, percentage]
  ) as [string, number, number][];
}
/**
 * Converts data series to CSV format and triggers download
 *
 * @param data - Array of data series to export
 * @param filename - Name of the file to download (without extension)
 */

export function exportDataToCsv(
  data: Data[],
  chartType: Chart,
  filename: string = "chart-data"
): void {
  // Create CSV content header
  let csvContent = "data:text/csv;charset=utf-8,";
  let headers = [];
  if (chartType === Chart.Pie || chartType === Chart.Map) {
    // For Pie and Map charts, use aggregated data
    const aggregatedRows = buildAggregatedCSVRows(data);
    aggregatedRows.sort((a, b) => b[1] - a[1]); // Sort by value descending
    headers = ["Label", "Value", "Percentage"];
    csvContent += headers.join(",") + "\n";
    aggregatedRows.forEach((row) => {
      csvContent +=
        row.map((c) => (typeof c === "number" ? c.toFixed(2) : c)).join(",") +
        "\n";
    });
  } else {
    // Add headers
    headers = ["Year"];
    data.forEach((series) => {
      headers.push(series.label);
    });
    csvContent += headers.join(",") + "\n";

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

    // Sort rows by x value and convert to CSV
    const sortedRows = Array.from(rowsMap.values()).sort((a, b) =>
      String(a.x).localeCompare(String(b.x))
    );

    // Build CSV rows
    sortedRows.forEach((row) => {
      const line = [row.x];
      data.forEach((series) => {
        line.push(row[series.label] !== undefined ? row[series.label] : "");
      });
      csvContent += line.join(",") + "\n";
    });
  }

  // Create and trigger download
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

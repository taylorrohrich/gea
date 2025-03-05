import React, { useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TableSortLabel,
  TablePagination,
  Box,
  Typography,
  Chip,
} from "@mui/material";
import { Data } from "@/shared/types/data";
import { Chart } from "@/shared/types/chart";

interface DataTableProps {
  data: Data[];
  title?: string;
  chartType: Chart;
}

// Type for regular table data (time series)
type TimeSeriesRow = {
  x: string;
  [key: string]: string | number;
};

// Type for aggregated data (for Pie/Map)
type AggregatedRow = {
  label: string;
  value: number;
  percentage?: string;
};

export const DataTable: React.FC<DataTableProps> = ({
  data,
  title,
  chartType,
}) => {
  // Helper function to determine if we should show aggregated data
  function shouldShowAggregatedData(chartType: Chart): boolean {
    return chartType === Chart.Pie || chartType === Chart.Map;
  }

  // State for sorting
  const [orderBy, setOrderBy] = React.useState<string>(
    shouldShowAggregatedData(chartType) ? "value" : "x"
  );
  const [order, setOrder] = React.useState<"asc" | "desc">("desc"); // Default to descending for aggregated views

  // State for pagination
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  // Create the appropriate data format based on chart type
  const tableData = useMemo(() => {
    if (!data || data.length === 0) {
      return [];
    }

    // For Pie and Map charts, show aggregated data
    if (shouldShowAggregatedData(chartType)) {
      return createAggregatedTableData(data);
    }

    // For all other charts, use time series format
    return createTimeSeriesTableData(data);
  }, [data, chartType]);

  // Create aggregated data format for Pie and Map charts
  function createAggregatedTableData(data: Data[]): AggregatedRow[] {
    // Calculate total for percentage
    const total = data.reduce((sum, series) => {
      const seriesSum = series.values.reduce((acc, point) => acc + point.y, 0);
      return sum + seriesSum;
    }, 0);

    // Create a row for each series with its aggregated value
    return data.map((series) => {
      const value = series.values.reduce((sum, point) => sum + point.y, 0);
      const percentage =
        total > 0 ? ((value / total) * 100).toFixed(1) + "%" : "0%";

      return {
        label: series.label,
        value,
        percentage,
      };
    });
  }

  // Create time series data format for Line, Bar, Area charts
  function createTimeSeriesTableData(data: Data[]): TimeSeriesRow[] {
    // Get all x values from all series
    const allXValues = new Set<string>();
    data.forEach((series) => {
      series.values.forEach((point) => {
        allXValues.add(point.x);
      });
    });

    // Create a map to hold all data points by x value
    const rowsMap = new Map<string, TimeSeriesRow>();

    // Initialize map with x values
    Array.from(allXValues).forEach((x) => {
      rowsMap.set(x, { x });
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

    // Convert map to array
    return Array.from(rowsMap.values());
  }

  // Get column headers based on chart type
  const columns = useMemo(() => {
    if (!data || data.length === 0) {
      return ["No Data"];
    }

    // For Pie and Map charts
    if (shouldShowAggregatedData(chartType)) {
      return ["Label", "Value", "Percentage"];
    }

    // For time series charts
    const cols = ["Year/Period"];
    data.forEach((series) => {
      cols.push(series.label);
    });

    return cols;
  }, [data, chartType]);

  // Handle sort request
  const handleRequestSort = (property: string) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  // Function to sort rows
  const sortedRows = useMemo(() => {
    // For aggregated data (Pie/Map)
    if (shouldShowAggregatedData(chartType)) {
      const aggregatedData = tableData as AggregatedRow[];

      if (orderBy === "label") {
        return [...aggregatedData].sort((a, b) => {
          const comparison = a.label.localeCompare(b.label);
          return order === "asc" ? comparison : -comparison;
        });
      } else {
        // Sort by value
        return [...aggregatedData].sort((a, b) => {
          const comparison = a.value < b.value ? -1 : a.value > b.value ? 1 : 0;
          return order === "asc" ? comparison : -comparison;
        });
      }
    }

    // For time series data
    const timeSeriesData = tableData as TimeSeriesRow[];

    if (orderBy === "x") {
      // Sort by x value (usually year/time)
      return [...timeSeriesData].sort((a, b) => {
        const comparison = String(a.x).localeCompare(String(b.x));
        return order === "asc" ? comparison : -comparison;
      });
    } else {
      // Sort by a data series value
      return [...timeSeriesData].sort((a, b) => {
        const valA = a[orderBy] !== undefined ? Number(a[orderBy]) : -Infinity;
        const valB = b[orderBy] !== undefined ? Number(b[orderBy]) : -Infinity;
        const comparison = valA < valB ? -1 : valA > valB ? 1 : 0;
        return order === "asc" ? comparison : -comparison;
      });
    }
  }, [tableData, order, orderBy, chartType]);

  // Handle page change
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Calculate pagination
  const paginatedRows = sortedRows.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // If no data, show a message
  if (tableData.length === 0) {
    return (
      <Box p={3} textAlign="center">
        <Typography variant="body1" color="text.secondary">
          No data available for display.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        position: "relative",
      }}
    >
      {/* Table description for aggregated views */}
      {shouldShowAggregatedData(chartType) && (
        <Box px={2} py={1}>
          <Typography variant="caption" color="text.secondary">
            {chartType === Chart.Pie
              ? "Showing aggregated data used in the pie chart. Each value is the sum across all periods."
              : "Showing aggregated data used in the map visualization. Each value is the sum across all periods."}
          </Typography>
        </Box>
      )}

      <TableContainer
        sx={{
          flexGrow: 1,
          overflow: "auto",
          maxHeight: "calc(100% - 52px)",
        }}
      >
        <Table stickyHeader size="small" aria-label="data table">
          <TableHead>
            <TableRow>
              {shouldShowAggregatedData(chartType) ? (
                // Headers for aggregated data (Pie/Map)
                <>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === "label"}
                      direction={orderBy === "label" ? order : "asc"}
                      onClick={() => handleRequestSort("label")}
                    >
                      Label
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right">
                    <TableSortLabel
                      active={orderBy === "value"}
                      direction={orderBy === "value" ? order : "desc"}
                      onClick={() => handleRequestSort("value")}
                    >
                      Value
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right">Percentage</TableCell>
                </>
              ) : (
                // Headers for time series data
                columns.map((column, index) => (
                  <TableCell
                    key={column}
                    align={index === 0 ? "left" : "right"}
                  >
                    <TableSortLabel
                      active={orderBy === (index === 0 ? "x" : column)}
                      direction={
                        orderBy === (index === 0 ? "x" : column) ? order : "asc"
                      }
                      onClick={() =>
                        handleRequestSort(index === 0 ? "x" : column)
                      }
                    >
                      {column}
                    </TableSortLabel>
                  </TableCell>
                ))
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {shouldShowAggregatedData(chartType)
              ? // Rows for aggregated data (Pie/Map)
                (paginatedRows as AggregatedRow[]).map((row, index) => (
                  <TableRow key={`${row.label}-${index}`} hover>
                    <TableCell component="th" scope="row">
                      {row.label}
                    </TableCell>
                    <TableCell align="right">{row.value.toFixed(2)}</TableCell>
                    <TableCell align="right">
                      <Chip
                        label={row.percentage}
                        size="small"
                        sx={{
                          bgcolor: "primary.light",
                          color: "primary.contrastText",
                          fontSize: "0.7rem",
                          height: 20,
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))
              : // Rows for time series data
                (paginatedRows as TimeSeriesRow[]).map((row, index) => (
                  <TableRow key={row.x + "-" + index} hover>
                    <TableCell component="th" scope="row">
                      {row.x}
                    </TableCell>
                    {data.map((series) => (
                      <TableCell key={series.label} align="right">
                        {row[series.label] !== undefined
                          ? Number(row[series.label]).toFixed(2)
                          : "—"}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box
        sx={{
          position: "sticky",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "background.paper",
          borderTop: "1px solid rgba(224, 224, 224, 1)",
          zIndex: 2,
          width: "100%",
        }}
      >
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={sortedRows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            "& .MuiTablePagination-toolbar": {
              minHeight: "48px",
            },
            display: "flex",
            width: "100%",
          }}
        />
      </Box>
    </Box>
  );
};

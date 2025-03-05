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
} from "@mui/material";
import { Data } from "@/shared/types/data";

interface DataTableProps {
  data: Data[];
  title?: string;
}

// Type for our table data
type TableRow = {
  x: string;
  [key: string]: string | number;
};

export const DataTable: React.FC<DataTableProps> = ({ data, title }) => {
  // State for sorting
  const [orderBy, setOrderBy] = React.useState<string>("x");
  const [order, setOrder] = React.useState<"asc" | "desc">("asc");

  // State for pagination
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  // Convert the Data[] format to a format suitable for tabular display
  const tableData: TableRow[] = useMemo(() => {
    if (!data || data.length === 0) {
      return [];
    }

    // Get all x values from all series
    const allXValues = new Set<string>();
    data.forEach((series) => {
      series.values.forEach((point) => {
        allXValues.add(point.x);
      });
    });

    // Create a map to hold all data points by x value
    const rowsMap = new Map<string, TableRow>();

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
  }, [data]);

  // Get column headers
  const columns = useMemo(() => {
    if (!data || data.length === 0) {
      return ["No Data"];
    }

    // Start with "X" (usually Year)
    const cols = ["Year"];

    // Add each series label as a column
    data.forEach((series) => {
      cols.push(series.label);
    });

    return cols;
  }, [data]);

  // Handle sort request
  const handleRequestSort = (property: string) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  // Function to sort rows
  const sortedRows = useMemo(() => {
    if (orderBy === "x") {
      // Sort by x value
      return [...tableData].sort((a, b) => {
        const comparison = String(a.x).localeCompare(String(b.x));
        return order === "asc" ? comparison : -comparison;
      });
    } else {
      // Sort by a data series value
      return [...tableData].sort((a, b) => {
        const valA = a[orderBy] !== undefined ? Number(a[orderBy]) : -Infinity;
        const valB = b[orderBy] !== undefined ? Number(b[orderBy]) : -Infinity;
        const comparison = valA < valB ? -1 : valA > valB ? 1 : 0;
        return order === "asc" ? comparison : -comparison;
      });
    }
  }, [tableData, order, orderBy]);

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
        height: "100%", // Fill the container height
        width: "100%",
        position: "relative", // Changed from absolute to relative
      }}
    >
      <TableContainer
        sx={{
          flexGrow: 1,
          overflow: "auto",
          maxHeight: "calc(100% - 52px)", // Reserve space for pagination
        }}
      >
        <Table stickyHeader size="small" aria-label="data table">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column}
                  align={column === "Year" ? "left" : "right"}
                >
                  <TableSortLabel
                    active={orderBy === (column === "Year" ? "x" : column)}
                    direction={
                      orderBy === (column === "Year" ? "x" : column)
                        ? order
                        : "asc"
                    }
                    onClick={() =>
                      handleRequestSort(column === "Year" ? "x" : column)
                    }
                  >
                    {column}
                  </TableSortLabel>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedRows.map((row, index) => (
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
          position: "sticky", // Sticky instead of fixed
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "background.paper",
          borderTop: "1px solid rgba(224, 224, 224, 1)",
          zIndex: 2,
          width: "100%", // Ensure full width
        }}
      >
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={tableData.length}
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

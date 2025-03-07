import React, { useMemo } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Chart } from "@/shared/types/chart";
import { Data } from "@/shared/types/data";
import { prepareTableData, shouldShowAggregatedData } from "./helpers";
import { NoData } from "../../NoData";

interface Props {
  data: Data[];
  chartType: Chart;
}

export function DataTable({ data, chartType }: Props) {
  // Prepare data and columns for DataGrid
  const { rows, columns } = useMemo(
    () => prepareTableData(data, chartType),
    [data, chartType]
  );

  // If no data, show a message
  if (rows.length === 0) {
    return <NoData />;
  }

  return (
    <div className="h-full w-full flex flex-col border-none">
      <DataGrid
        rows={rows}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: { pageSize: 10 },
          },
          sorting: {
            sortModel: shouldShowAggregatedData(chartType)
              ? [{ field: "value", sort: "desc" }]
              : [{ field: "x", sort: "asc" }],
          },
        }}
        pageSizeOptions={[5, 10, 25, 50]}
        disableRowSelectionOnClick
        getRowHeight={() => "auto"}
        sx={{
          border: "none",
          "& .MuiDataGrid-cell": {
            py: 0.5,
          },
          "& .MuiDataGrid-columnHeaders": {
            borderBottom: "1px solid rgba(224, 224, 224, 1)",
          },
          "& .MuiDataGrid-virtualScroller": {
            overflowY: "auto",
          },
        }}
      />
    </div>
  );
}

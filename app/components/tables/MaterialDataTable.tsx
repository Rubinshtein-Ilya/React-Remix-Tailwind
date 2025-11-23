import React from "react";
import {
  MaterialReactTable,
  type MRT_TableInstance,
  type MRT_RowData,
} from "material-react-table";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";

interface MaterialDataTableProps<T extends MRT_RowData = MRT_RowData> {
  table: MRT_TableInstance<T>;
}

// Создаем минималистичную тему MUI
const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1976d2",
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          margin: 0,
          padding: 0,
        },
      },
    },
  },
});

function MaterialDataTable<T extends MRT_RowData = MRT_RowData>({
  table,
}: MaterialDataTableProps<T>) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <MaterialReactTable table={table} />
    </ThemeProvider>
  );
}

export default MaterialDataTable;

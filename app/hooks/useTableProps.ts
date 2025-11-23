import { useMemo } from "react";
import type { MRT_TableOptions, MRT_RowData } from "material-react-table";

type Props<T extends MRT_RowData> = Partial<Partial<MRT_TableOptions<T>>>

export function useTableProps<T extends MRT_RowData>({ manualPagination }: Props<T> = {}): Partial<MRT_TableOptions<T>> {
  return useMemo(() => ({
    // Основные возможности
    enablePagination: true,
    enableSorting: true,
    enableGlobalFilter: true,
    enableRowSelection: false,
    enableColumnDragging: false,
    enableColumnOrdering: false,
    enableDensityToggle: false,
    enableFullScreenToggle: true,
    enableHiding: false,
    
    // Серверная пагинация по умолчанию
    manualPagination: manualPagination === undefined ? true : manualPagination,
    manualSorting: false,
    
    // Стили таблицы
    muiTableProps: {
      sx: {
        "& .MuiTableHead-root": {
          backgroundColor: "rgba(0, 0, 0, 0.04)",
        },
        "& .MuiTableCell-root": {
          borderColor: "rgba(0, 0, 0, 0.12)",
        },
      },
    },
    
    // Настройки пагинации
    muiPaginationProps: {
      rowsPerPageOptions: [5, 10, 20, 50, 100, 200],
      showFirstButton: true,
      showLastButton: true,
    },
    
    // Стили body таблицы
    muiTableBodyProps: {
      sx: {
        "& tr:hover": {
          backgroundColor: "rgba(0, 0, 0, 0.04)",
        },
      },
    },
    
    // Стили заголовков
    muiTableHeadCellProps: {
      sx: {
        fontWeight: 600,
        fontSize: "0.875rem",
      },
    },
    
    // Стили ячеек
    muiTableBodyCellProps: {
      sx: {
        fontSize: "0.875rem",
      },
    },
    
    // Прозрачные тулбары
    muiTopToolbarProps: {
      sx: {
        backgroundColor: "transparent",
      },
    },
    
    muiBottomToolbarProps: {
      sx: {
        backgroundColor: "transparent",
      },
    },
    
    // Начальное состояние
    initialState: {
      showGlobalFilter: true,
    },
  }), []);
} 
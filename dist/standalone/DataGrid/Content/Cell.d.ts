import { IDataGridColumnDef } from "../DataGrid";
import React, { Dispatch, SetStateAction } from "react";
import { GridChildComponentProps } from "react-window";
export interface CellContextType {
    /**
     * The grid columns
     */
    columns: IDataGridColumnDef[];
    /**
     * The hover state and set state action
     */
    hoverState: [number | null, Dispatch<SetStateAction<number | null>>];
}
export declare const CellContext: React.Context<CellContextType | undefined>;
export declare const useCellContext: () => CellContextType;
declare const Cell: (props: GridChildComponentProps) => React.ReactElement;
export default Cell;

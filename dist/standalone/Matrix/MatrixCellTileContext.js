import React, { useContext } from "react";
export const MatrixCellTilePropsContext = React.createContext(undefined);
export const useMatrixCellTileProps = () => {
    const ctx = useContext(MatrixCellTilePropsContext);
    if (!ctx)
        throw new Error("Matrix cell tile props context not set");
    return ctx;
};

import { jsx as _jsx } from "react/jsx-runtime";
import React from "react";
import { ErrorDialog } from "./ErrorDialog";
const InfoDialogRaw = (props) => (_jsx(ErrorDialog, { ...props }));
export const InfoDialog = React.memo(InfoDialogRaw);

import React from "react";
import { ErrorDialog } from "./ErrorDialog";
const InfoDialogRaw = (props) => (React.createElement(ErrorDialog, { ...props }));
export const InfoDialog = React.memo(InfoDialogRaw);

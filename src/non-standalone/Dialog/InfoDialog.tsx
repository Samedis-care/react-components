import React from "react";
import { ErrorDialog } from "./ErrorDialog";
import { IDialogConfigSimple } from "./Types";

const InfoDialogRaw = (props: IDialogConfigSimple) => (
	<ErrorDialog {...props} />
);

export const InfoDialog = React.memo(InfoDialogRaw);

import React from "react";
import { ErrorDialog } from "./ErrorDialog";
import { IDialogConfigSimple } from "./Types";

export const InfoDialog = React.memo((props: IDialogConfigSimple) => (
	<ErrorDialog {...props} />
));

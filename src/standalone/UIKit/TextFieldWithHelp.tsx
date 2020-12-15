import React from "react";
import { TextField, TextFieldProps } from "@material-ui/core";

const TextFieldWithHelp = (props: TextFieldProps) => (
	<TextField InputLabelProps={{ shrink: true }} {...props} />
);

export default React.memo(TextFieldWithHelp);

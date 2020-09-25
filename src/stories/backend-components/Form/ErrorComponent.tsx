import React from "react";
import { ErrorComponentProps } from "../../../backend-components/Form/Form";

const ErrorComponent = (props: ErrorComponentProps) => (
	<>Error: ${props.error}</>
);

export default React.memo(ErrorComponent);

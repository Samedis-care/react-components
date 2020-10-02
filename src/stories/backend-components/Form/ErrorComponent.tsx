import React, { useCallback, useEffect, useState } from "react";
import { ErrorComponentProps } from "../../../backend-components/Form";
import { debounce } from "../../../utils";
import { ErrorDialog } from "../../../non-standalone/Dialog";

const ErrorComponent = (props: ErrorComponentProps) => {
	const propError = props.error;

	const [error, setError] = useState<Error | null>(props.error);
	const unsetErrorDirectly = useCallback(() => {
		setError(null);
	}, [setError]);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const unsetError = useCallback(debounce(unsetErrorDirectly, 5000), [
		unsetErrorDirectly,
	]);

	useEffect(() => {
		setError(propError);
		unsetError();
	}, [unsetError, setError, propError]);

	return (
		error && (
			<ErrorDialog
				title={"An error occurred"}
				message={error.message}
				onClose={unsetErrorDirectly}
				buttons={[
					{
						text: "Okay",
						autoFocus: true,
					},
				]}
			/>
		)
	);
};

export default React.memo(ErrorComponent);

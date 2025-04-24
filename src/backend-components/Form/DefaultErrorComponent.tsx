import React, { useEffect } from "react";
import { showErrorDialog } from "../../non-standalone";
import { useDialogContext } from "../../framework";
import { ErrorComponentProps } from "./Form";
import { isValidationError } from "./ValidationError";
import throwError from "../../utils/throwError";

const DefaultErrorComponent = (props: ErrorComponentProps) => {
	const propError = props.error;
	const [pushDialog] = useDialogContext();

	useEffect(() => {
		let validationErrorClass: string | null = null;
		if (isValidationError(propError)) {
			// eslint-disable-next-line no-console
			console.error("ValidationError", propError.mode, propError.result);
			validationErrorClass =
				propError.mode === "error"
					? ".Mui-error"
					: propError.mode === "warn"
						? ".Mui-warning"
						: throwError("not implemented");
		} else {
			// eslint-disable-next-line no-console
			console.error(propError);
		}

		void (async () => {
			await showErrorDialog(pushDialog, propError);
			if (!validationErrorClass) return;
			const errElement = document.querySelector(validationErrorClass);
			if (errElement) errElement.scrollIntoView();
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [propError]);

	return <></>;
};

export default React.memo(DefaultErrorComponent);

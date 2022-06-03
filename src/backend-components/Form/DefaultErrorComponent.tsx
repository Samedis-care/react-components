import React, { useEffect } from "react";
import { showErrorDialog } from "../../non-standalone";
import { useDialogContext } from "../../framework";
import { ErrorComponentProps } from "./Form";

const DefaultErrorComponent = (props: ErrorComponentProps) => {
	const propError = props.error;
	const [pushDialog] = useDialogContext();

	useEffect(() => {
		// eslint-disable-next-line no-console
		console.error(propError);

		void showErrorDialog(pushDialog, propError);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [propError]);

	return <></>;
};

export default React.memo(DefaultErrorComponent);

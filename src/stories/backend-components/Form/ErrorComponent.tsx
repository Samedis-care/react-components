import React, { useEffect } from "react";
import { ErrorComponentProps } from "../../../backend-components/Form";
import { ErrorDialog } from "../../../non-standalone/Dialog";
import { useDialogContext } from "../../../framework";

const ErrorComponent = (props: ErrorComponentProps) => {
	const propError = props.error;

	const [pushDialog] = useDialogContext();

	useEffect(() => {
		pushDialog(
			<ErrorDialog
				title={"An error occurred"}
				message={propError.message}
				buttons={[
					{
						text: "Okay",
						autoFocus: true,
					},
				]}
			/>
		);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [propError]);

	return <></>;
};

export default React.memo(ErrorComponent);

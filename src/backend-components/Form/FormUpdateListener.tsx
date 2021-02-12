import React, { useEffect } from "react";
import { useFormikContext } from "formik";

export interface FormUpdateListenerProps<KeyT extends string> {
	/**
	 * The current backend data
	 */
	backendData: Record<KeyT, unknown>;
}

/**
 * Automatically updates untouched fields based on backend data
 */
const FormUpdateListener = <KeyT extends string>(
	props: FormUpdateListenerProps<KeyT>
) => {
	const { backendData } = props;
	// eslint-disable-next-line @typescript-eslint/unbound-method
	const { setFieldValue, touched, values: formData } = useFormikContext<
		Record<KeyT, unknown>
	>();

	useEffect(() => {
		Object.keys(formData).forEach((fieldRaw) => {
			const field = fieldRaw as KeyT;
			if (!touched[field]) setFieldValue(field, backendData[field]);
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [backendData]);

	return <></>;
};

export default React.memo(FormUpdateListener);

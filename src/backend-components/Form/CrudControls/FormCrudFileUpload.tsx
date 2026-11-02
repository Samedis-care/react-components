import React, { ForwardedRef, RefAttributes } from "react";
import { ModelUnknown } from "../../../backend-integration/Model/Model";
import CrudFileUpload, {
	CrudFileUploadProps,
} from "../../FileUpload/CrudFileUpload";
import useLazyCrudConnector, {
	extractLazyCrudConnectorParams,
	UseLazyCrudConnectorParams,
} from "../useLazyCrudConnector";
import { useFormContextLite } from "../Form";
import { FileUploadDispatch } from "../../../standalone/FileUpload/Generic";

export interface FormCrudFileUploadProps
	extends
		Omit<CrudFileUploadProps, "connector" | "errorComponent">,
		UseLazyCrudConnectorParams<Record<string, unknown>> {
	/**
	 * Is the control read-only?
	 * @remarks It is read-only while the Form is, whatever this says.
	 */
	readOnly?: boolean;
	/**
	 * Mark the control as modified while file changes are queued
	 * @remarks Follows the Form's `showDirtyState` unless set.
	 * @see CrudFileUploadProps.showDirtyState
	 */
	showDirtyState?: boolean;
}

/**
 * A CrudFileUpload for a collection that belongs to the Form's record, e.g. its documents
 * @remarks Only for use in a Form. Its writes are queued in a LazyConnector
 *          (useLazyCrudConnector, from `field`, `getEndpoint`, `initialId` and the other
 *          params of the hook) and sent after the Form saved the record, so a new record
 *          gets its files too. The Form's custom state of `field` holds that connector.
 *          It takes the Form's `readOnly`, `errorComponent` and `showDirtyState`.
 */
const FormCrudFileUpload = (
	props: FormCrudFileUploadProps & RefAttributes<FileUploadDispatch>,
	ref: ForwardedRef<FileUploadDispatch>,
) => {
	const [connectorParams, otherProps] = extractLazyCrudConnectorParams<
		Record<string, unknown>,
		typeof props
	>(props);
	const { connector } =
		useLazyCrudConnector<Record<string, unknown>>(connectorParams);
	const { readOnly, errorComponent, showDirtyState } =
		useFormContextLite<ModelUnknown>();

	return (
		<CrudFileUpload
			{...otherProps}
			ref={ref}
			connector={connector}
			errorComponent={errorComponent}
			// undefined unless set, so that the theme's default applies
			readOnly={readOnly || otherProps.readOnly}
			showDirtyState={otherProps.showDirtyState ?? showDirtyState}
		/>
	);
};

export default React.memo(React.forwardRef(FormCrudFileUpload));

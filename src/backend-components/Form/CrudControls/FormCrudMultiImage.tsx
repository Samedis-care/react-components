import React from "react";
import { ModelUnknown } from "../../../backend-integration/Model/Model";
import CrudMultiImage, {
	CrudMultiImageProps,
} from "../../FileUpload/CrudMultiImage";
import useLazyCrudConnector, {
	extractLazyCrudConnectorParams,
	UseLazyCrudConnectorParams,
} from "../useLazyCrudConnector";
import { useFormContextLite } from "../Form";

export interface FormCrudMultiImageProps
	extends
		Omit<CrudMultiImageProps, "connector" | "errorComponent">,
		UseLazyCrudConnectorParams<Record<string, unknown>> {
	/**
	 * Is the control read-only?
	 * @remarks It is read-only while the Form is, whatever this says.
	 */
	readOnly?: boolean;
}

/**
 * A CrudMultiImage for a collection that belongs to the Form's record, e.g. its photos
 * @remarks Only for use in a Form. Its writes are queued in a LazyConnector
 *          (useLazyCrudConnector, from `field`, `getEndpoint`, `initialId` and the other
 *          params of the hook) and sent after the Form saved the record, so a new record
 *          gets its images too. The Form's custom state of `field` holds that connector.
 *          It takes the Form's `readOnly` and `errorComponent`.
 *
 *          The primary image stays the owner's to store. The record is saved before the
 *          queue is written, so a new image chosen as the primary has a client-side id at
 *          that point; `LazyConnector.mapId` gives the server's once the queue is written.
 */
const FormCrudMultiImage = (props: FormCrudMultiImageProps) => {
	const [connectorParams, otherProps] = extractLazyCrudConnectorParams<
		Record<string, unknown>,
		typeof props
	>(props);
	const { connector } =
		useLazyCrudConnector<Record<string, unknown>>(connectorParams);
	const { readOnly, errorComponent } = useFormContextLite<ModelUnknown>();

	return (
		<CrudMultiImage
			{...otherProps}
			connector={connector}
			errorComponent={errorComponent}
			// undefined unless set, so that the theme's default applies
			readOnly={readOnly || otherProps.readOnly}
		/>
	);
};

export default React.memo(FormCrudMultiImage);

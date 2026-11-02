import { jsx as _jsx } from "react/jsx-runtime";
import React from "react";
import CrudFileUpload from "../../FileUpload/CrudFileUpload";
import useLazyCrudConnector, { extractLazyCrudConnectorParams, } from "../useLazyCrudConnector";
import { useFormContextLite } from "../Form";
/**
 * A CrudFileUpload for a collection that belongs to the Form's record, e.g. its documents
 * @remarks Only for use in a Form. Its writes are queued in a LazyConnector
 *          (useLazyCrudConnector, from `field`, `getEndpoint`, `initialId` and the other
 *          params of the hook) and sent after the Form saved the record, so a new record
 *          gets its files too. The Form's custom state of `field` holds that connector.
 *          It takes the Form's `readOnly`, `errorComponent` and `showDirtyState`.
 */
const FormCrudFileUpload = (props, ref) => {
    const [connectorParams, otherProps] = extractLazyCrudConnectorParams(props);
    const { connector } = useLazyCrudConnector(connectorParams);
    const { readOnly, errorComponent, showDirtyState } = useFormContextLite();
    return (_jsx(CrudFileUpload, { ...otherProps, ref: ref, connector: connector, errorComponent: errorComponent, 
        // undefined unless set, so that the theme's default applies
        readOnly: readOnly || otherProps.readOnly, showDirtyState: otherProps.showDirtyState ?? showDirtyState }));
};
export default React.memo(React.forwardRef(FormCrudFileUpload));

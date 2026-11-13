import { jsx as _jsx } from "react/jsx-runtime";
import React from "react";
import CrudMultiSelect from "../../Selector/CrudMultiSelect";
import useLazyCrudConnector, { extractLazyCrudConnectorParams, } from "../useLazyCrudConnector";
import { FORM_SUBMITTING_READ_ONLY_REASON, useFormContextLite } from "../Form";
const FormCrudMultiSelect = (props, ref) => {
    const [connectorParams, otherProps] = extractLazyCrudConnectorParams(props);
    const { connector } = useLazyCrudConnector(connectorParams);
    const { readOnly, readOnlyReasons, errorComponent } = useFormContextLite();
    // a save makes the Form read-only too, but changing the field then would take the user's
    // focus and typed search away: while it runs, the field only takes no picks or removals
    const readOnlyBesidesSaving = Object.keys(readOnlyReasons).some((reason) => reason !== FORM_SUBMITTING_READ_ONLY_REASON);
    // the caller's props first: the Form's state wins, so an explicit falsy readOnly or
    // blockWrites cannot unlock the control in a read-only or saving form
    return (_jsx(CrudMultiSelect, { ...otherProps, connector: connector, errorComponent: errorComponent, readOnly: otherProps.readOnly || readOnlyBesidesSaving, blockWrites: otherProps.blockWrites || readOnly, field: connectorParams.field, ref: ref }));
};
export const ForwardedCrudMultiSelect = React.forwardRef(FormCrudMultiSelect);
export default React.memo(ForwardedCrudMultiSelect);

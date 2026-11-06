import { jsx as _jsx } from "react/jsx-runtime";
import React from "react";
import CrudMultiSelect from "../../Selector/CrudMultiSelect";
import useLazyCrudConnector, { extractLazyCrudConnectorParams, } from "../useLazyCrudConnector";
import { useFormContextLite } from "../Form";
const FormCrudMultiSelect = (props, ref) => {
    const [connectorParams, otherProps] = extractLazyCrudConnectorParams(props);
    const { connector } = useLazyCrudConnector(connectorParams);
    const { readOnly, errorComponent } = useFormContextLite();
    // the caller's props first: the Form's state wins, so an explicit falsy disabled
    // cannot unlock the control in a read-only form
    return (_jsx(CrudMultiSelect, { ...otherProps, connector: connector, errorComponent: errorComponent, disabled: otherProps.disabled || readOnly, field: connectorParams.field, ref: ref }));
};
export const ForwardedCrudMultiSelect = React.forwardRef(FormCrudMultiSelect);
export default React.memo(ForwardedCrudMultiSelect);

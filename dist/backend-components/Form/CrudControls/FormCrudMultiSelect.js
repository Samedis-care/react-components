import { jsx as _jsx } from "react/jsx-runtime";
import React from "react";
import CrudMultiSelect from "../../Selector/CrudMultiSelect";
import useLazyCrudConnector, { extractLazyCrudConnectorParams, } from "../useLazyCrudConnector";
import { useFormContextLite } from "../Form";
const FormCrudMultiSelect = (props, ref) => {
    const [connectorParams, otherProps] = extractLazyCrudConnectorParams(props);
    const { connector } = useLazyCrudConnector(connectorParams);
    const { readOnly, errorComponent } = useFormContextLite();
    return (_jsx(CrudMultiSelect, { connector: connector, errorComponent: errorComponent, disabled: props.disabled || readOnly, field: connectorParams.field, ref: ref, ...otherProps }));
};
export const ForwardedCrudMultiSelect = React.forwardRef(FormCrudMultiSelect);
export default React.memo(ForwardedCrudMultiSelect);

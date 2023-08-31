import React from "react";
import CrudMultiSelect from "../../Selector/CrudMultiSelect";
import useLazyCrudConnector, { extractLazyCrudConnectorParams, } from "../useLazyCrudConnector";
import { useFormContextLite } from "../Form";
const FormCrudMultiSelect = (props, ref) => {
    const [connectorParams, otherProps] = extractLazyCrudConnectorParams(props);
    const { connector } = useLazyCrudConnector(connectorParams);
    const { readOnly, errorComponent } = useFormContextLite();
    return (React.createElement(CrudMultiSelect, { connector: connector, errorComponent: errorComponent, disabled: props.disabled || readOnly, field: connectorParams.field, ref: ref, ...otherProps }));
};
export default React.memo(React.forwardRef(FormCrudMultiSelect));

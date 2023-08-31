import React from "react";
import TypeStringArray from "../TypeStringArray";
/**
 * No-op renderer for string array type
 */
class RendererBackendStringArray extends TypeStringArray {
    render(params) {
        const { visibility, field, value } = params;
        if (visibility.disabled)
            return React.createElement(React.Fragment, null);
        if (visibility.hidden) {
            return (React.createElement("input", { type: "hidden", name: field, value: value?.join(",") ?? "", readOnly: true, "aria-hidden": "true" }));
        }
        throw new Error("Not supported");
    }
}
export default RendererBackendStringArray;

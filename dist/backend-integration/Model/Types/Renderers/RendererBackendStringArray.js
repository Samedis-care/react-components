import { Fragment as _Fragment, jsx as _jsx } from "react/jsx-runtime";
import TypeStringArray from "../TypeStringArray";
/**
 * No-op renderer for string array type
 */
class RendererBackendStringArray extends TypeStringArray {
    render(params) {
        const { visibility, field, value } = params;
        if (visibility.disabled)
            return _jsx(_Fragment, {});
        if (visibility.hidden) {
            return (_jsx("input", { type: "hidden", name: field, value: value?.join(",") ?? "", readOnly: true, "aria-hidden": "true" }));
        }
        throw new Error("Not supported");
    }
}
export default RendererBackendStringArray;

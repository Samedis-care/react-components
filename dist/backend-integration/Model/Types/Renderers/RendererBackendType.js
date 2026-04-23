import { Fragment as _Fragment, jsx as _jsx } from "react/jsx-runtime";
/**
 * No-op renderer
 */
class RendererBackendType {
    validate() {
        return null;
    }
    getFilterType() {
        return null;
    }
    getDefaultValue() {
        return null;
    }
    stringify(value) {
        return JSON.stringify(value);
    }
    render(params) {
        const { visibility } = params;
        if (visibility.disabled)
            return _jsx(_Fragment, {});
        throw new Error("Not supported");
    }
}
export default RendererBackendType;

import React from "react";
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
            return React.createElement(React.Fragment, null);
        throw new Error("Not supported");
    }
}
export default RendererBackendType;

var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import React from "react";
import TypeStringArray from "../TypeStringArray";
/**
 * No-op renderer for string array type
 */
var RendererBackendStringArray = /** @class */ (function (_super) {
    __extends(RendererBackendStringArray, _super);
    function RendererBackendStringArray() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    RendererBackendStringArray.prototype.render = function (params) {
        var _a;
        var visibility = params.visibility, field = params.field, value = params.value;
        if (visibility.disabled)
            return React.createElement(React.Fragment, null);
        if (visibility.hidden) {
            return (React.createElement("input", { type: "hidden", name: field, value: (_a = value === null || value === void 0 ? void 0 : value.join(",")) !== null && _a !== void 0 ? _a : "", readOnly: true, "aria-hidden": "true" }));
        }
        throw new Error("Not supported");
    };
    return RendererBackendStringArray;
}(TypeStringArray));
export default RendererBackendStringArray;

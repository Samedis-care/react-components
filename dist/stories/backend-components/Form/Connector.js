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
import { Connector } from "../../../backend-integration/Connector";
var FormStoryConnector = /** @class */ (function (_super) {
    __extends(FormStoryConnector, _super);
    function FormStoryConnector() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    FormStoryConnector.prototype.create = function () {
        throw new Error("Unimplemented");
    };
    FormStoryConnector.prototype.delete = function () {
        throw new Error("Unimplemented");
    };
    FormStoryConnector.prototype.index = function () {
        throw new Error("Unimplemented");
    };
    FormStoryConnector.prototype.read = function () {
        throw new Error("Unimplemented");
    };
    FormStoryConnector.prototype.update = function () {
        throw new Error("Unimplemented");
    };
    return FormStoryConnector;
}(Connector));
export default FormStoryConnector;

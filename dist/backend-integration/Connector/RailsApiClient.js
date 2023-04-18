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
import JsonApiClient from "./JsonApiClient";
import dataToFile from "../../utils/dataToFile";
var objectContainsBlob = function (obj) {
    for (var key in obj) {
        if (!Object.prototype.hasOwnProperty.call(obj, key))
            continue;
        var value = obj[key];
        if (typeof value === "object") {
            if (objectContainsBlob(value))
                return true;
        }
        else if (typeof value === "string") {
            if (value.startsWith("data:"))
                return true;
        }
    }
    return false;
};
var convertDataToFormData = function (data) {
    if (typeof data === "number")
        return data.toString();
    if (typeof data === "boolean")
        return data ? "true" : "false";
    if (data === null)
        return "null";
    if (typeof data !== "string") {
        // eslint-disable-next-line no-console
        console.log("[Components-Care] [RailsApiClient] [convertDataToFormData] unsupported data", data);
        throw new Error("unsupported data " + JSON.stringify(data));
    }
    if (data.startsWith("data:")) {
        return dataToFile(data);
    }
    return data;
};
var objectToRails = function (obj) {
    var ret = [];
    var _loop_1 = function (key) {
        if (!Object.prototype.hasOwnProperty.call(obj, key))
            return "continue";
        var value = obj[key];
        if (Array.isArray(value)) {
            ret.push.apply(ret, value.map(function (val) {
                return [key + "[]", convertDataToFormData(val)];
            }));
        }
        else if (typeof value === "object") {
            var dots = objectToRails(value);
            dots.forEach(function (_a) {
                var dot = _a[0], nestedValue = _a[1];
                var _b = dot.split("["), dotKey = _b[0], suffix = _b.slice(1);
                ret.push([
                    key +
                        "[" +
                        dotKey +
                        "]" +
                        (suffix.length > 0 ? "[" + suffix.join("[") : ""),
                    nestedValue,
                ]);
            });
        }
        else if (value !== undefined) {
            ret.push([key, convertDataToFormData(value)]);
        }
    };
    for (var key in obj) {
        _loop_1(key);
    }
    return ret;
};
var RailsApiClient = /** @class */ (function (_super) {
    __extends(RailsApiClient, _super);
    function RailsApiClient() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    RailsApiClient.prototype.convertBody = function (body, headers) {
        if (objectContainsBlob(body)) {
            var formBody_1 = new FormData();
            objectToRails(body).forEach(function (_a) {
                var key = _a[0], value = _a[1];
                formBody_1.append(key, value);
            });
            return formBody_1;
        }
        else {
            // Use JSON
            return _super.prototype.convertBody.call(this, body, headers);
        }
    };
    return RailsApiClient;
}(JsonApiClient));
export default RailsApiClient;

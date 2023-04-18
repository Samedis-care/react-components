/**
 * Adds the given query parameters to the given url
 * @param url The base url
 * @param args The query parameters
 * @private
 * @returns The url with query parameter
 */
var addGetParams = function (url, args) {
    if (!args) {
        return url;
    }
    var argString = "";
    var _loop_1 = function (key) {
        if (!Object.prototype.hasOwnProperty.call(args, key)) {
            return "continue";
        }
        var value = args[key];
        if (value === null || value === undefined)
            return "continue";
        if (Array.isArray(value)) {
            argString += value
                .map(function (entry) {
                return "&" +
                    encodeURIComponent(key + "[]") +
                    "=" +
                    encodeURIComponent(stringifyValue(entry));
            })
                .join("");
        }
        else {
            argString +=
                "&" +
                    encodeURIComponent(key) +
                    "=" +
                    encodeURIComponent(stringifyValue(value));
        }
    };
    for (var key in args) {
        _loop_1(key);
    }
    return argString.length === 0 ? url : url + "?" + argString.substr(1);
};
var stringifyValue = function (value) {
    if (typeof value === "string") {
        return value;
    }
    else if (typeof value === "number" || typeof value === "boolean") {
        return value.toString();
    }
    else if (typeof value === "object") {
        return JSON.stringify(value);
    }
    else {
        throw new Error("Unhandled type " + typeof value);
    }
};
export default addGetParams;

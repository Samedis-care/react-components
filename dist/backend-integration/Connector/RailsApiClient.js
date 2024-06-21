import JsonApiClient from "./JsonApiClient";
import dataToFile from "../../utils/dataToFile";
const objectContainsBlob = (obj) => {
    for (const key in obj) {
        if (!Object.prototype.hasOwnProperty.call(obj, key))
            continue;
        const value = obj[key];
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
const objectContainsArrayOfObjects = (obj) => {
    if (Array.isArray(obj)) {
        if (obj.find((entry) => typeof entry === "object") !== undefined)
            return true;
    }
    for (const key in obj) {
        if (!Object.prototype.hasOwnProperty.call(obj, key))
            continue;
        const value = obj[key];
        if (typeof value === "object") {
            if (objectContainsArrayOfObjects(value))
                return true;
        }
    }
    return false;
};
const convertDataToFormData = (data) => {
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
const objectToRails = (obj) => {
    const ret = [];
    for (const key in obj) {
        if (!Object.prototype.hasOwnProperty.call(obj, key))
            continue;
        const value = obj[key];
        if (Array.isArray(value)) {
            ret.push(...value.map((val) => [key + "[]", convertDataToFormData(val)]));
        }
        else if (typeof value === "object") {
            const dots = objectToRails(value);
            dots.forEach(([dot, nestedValue]) => {
                const [dotKey, ...suffix] = dot.split("[");
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
    }
    return ret;
};
class RailsApiClient extends JsonApiClient {
    convertBody(body, headers) {
        if (objectContainsBlob(body) &&
            !objectContainsArrayOfObjects(body) // too sketchy, does not work with omitted/optional keys
        ) {
            const formBody = new FormData();
            objectToRails(body).forEach(([key, value]) => {
                formBody.append(key, value);
            });
            return formBody;
        }
        else {
            // Use JSON
            return super.convertBody(body, headers);
        }
    }
}
export default RailsApiClient;

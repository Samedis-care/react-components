var validateOptional = function (callback) { return function (value, values, fieldDef) {
    if (!value)
        return null;
    return callback(value, values, fieldDef);
}; };
export default validateOptional;

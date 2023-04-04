var validationChain = function () {
    var callback = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        callback[_i] = arguments[_i];
    }
    return function (value, values, fieldDef) {
        var result = callback
            .map(function (cb) { return cb(value, values, fieldDef); })
            .filter(function (entry) { return entry != null; });
        if (result.length === 0)
            return null;
        return result[0];
    };
};
export default validationChain;

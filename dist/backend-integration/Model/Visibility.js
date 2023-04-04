export var getVisibility = function (cb, values, initialValues) {
    if (typeof cb === "function") {
        return cb(values, initialValues);
    }
    return cb;
};

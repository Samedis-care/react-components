export const getVisibility = (cb, values, initialValues) => {
    if (typeof cb === "function") {
        return cb(values, initialValues);
    }
    return cb;
};

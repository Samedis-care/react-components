const validationChain = (...callback) => (value, values, fieldDef) => {
    const result = callback
        .map((cb) => cb(value, values, fieldDef))
        .filter((entry) => entry != null);
    if (result.length === 0)
        return null;
    return result[0];
};
export default validationChain;

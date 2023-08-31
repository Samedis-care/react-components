const validateLocalized = (callback) => (value, values, fieldDef) => {
    if (!value)
        return null;
    return Object.keys(value)
        .map((language) => {
        const result = callback(value[language], values, fieldDef);
        if (result)
            return language + ": " + result;
        return null;
    })
        .join("\n");
};
export default validateLocalized;

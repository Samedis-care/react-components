const validateLocalized = (callback) => (value, values, fieldDef) => {
    if (!value)
        return null;
    const validationMsgs = Object.keys(value)
        .map((language) => {
        const result = callback(value[language], values, fieldDef);
        if (result)
            return language + ": " + result;
        return null;
    })
        .filter((result) => !!result);
    if (validationMsgs.length === 0)
        return null;
    return validationMsgs.join("\n");
};
export default validateLocalized;

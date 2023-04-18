var inlineLog = function (data, prefix) {
    if (prefix === void 0) { prefix = ""; }
    // eslint-disable-next-line no-console
    console.log(prefix, data);
    return data;
};
export default inlineLog;

var isPlainObject = function (o) {
    return typeof o == "object" && o != null && o.constructor == Object;
};
export default isPlainObject;

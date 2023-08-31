const isPlainObject = (o) => typeof o == "object" && o != null && o.constructor == Object;
export default isPlainObject;

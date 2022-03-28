const isPlainObject = (o: unknown): o is Record<string, unknown> =>
	typeof o == "object" && o != null && o.constructor == Object;

export default isPlainObject;

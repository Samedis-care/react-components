const inlineLog = <T>(data: T, prefix = ""): T => {
	// eslint-disable-next-line no-console
	console.log(prefix, data);
	return data;
};

export default inlineLog;

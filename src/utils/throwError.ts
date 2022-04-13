const throwError = <T>(msg: string): T => {
	throw new Error(msg);
};

export default throwError;

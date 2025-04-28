const accessSlotProps = <T, R extends object>(
	state: T,
	slotProps: undefined | null | R | ((state: T) => R),
): R | undefined => {
	if (slotProps == null) return undefined;
	if (typeof slotProps === "function") return slotProps(state);
	return slotProps;
};

export default accessSlotProps;

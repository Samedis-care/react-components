import accessSlotProps from "./accessSlotProps";

/**
 * Adds attributes to one slot of a MUI component's `slotProps`, keeping what the caller
 * put there
 * @param slotProps The caller's `slotProps`
 * @param slot The slot to add to, e.g. `htmlInput` of a TextField or `input` of a Checkbox
 * @param attributes The attributes to add. `aria-describedby` is appended to the caller's,
 *                   the others replace the caller's value; undefined ones are left out.
 * @returns `slotProps` itself when there is nothing to add, else a copy whose slot holds
 *          the attributes, as an object or, if the caller passed a function, a function
 */
const addSlotAttributes = <SlotPropsT extends object | undefined>(
	slotProps: SlotPropsT,
	slot: string,
	attributes: Record<string, string | boolean | undefined>,
): SlotPropsT => {
	const added = Object.entries(attributes).filter(
		([, value]) => value !== undefined,
	);
	if (added.length === 0) return slotProps;
	const own = (slotProps as Record<string, unknown> | undefined)?.[slot] as
		| Record<string, unknown>
		| ((state: unknown) => Record<string, unknown>)
		| undefined;
	const merge = (props: Record<string, unknown> | undefined) => {
		const result = { ...props };
		added.forEach(([key, value]) => {
			result[key] =
				key === "aria-describedby" && props?.[key]
					? `${props[key] as string} ${value as string}`
					: value;
		});
		return result;
	};
	return {
		...slotProps,
		[slot]:
			typeof own === "function"
				? (state: unknown) => merge(accessSlotProps(state, own))
				: merge(own),
	};
};

export default addSlotAttributes;

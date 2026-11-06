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
declare const addSlotAttributes: <SlotPropsT extends object | undefined>(slotProps: SlotPropsT, slot: string, attributes: Record<string, string | boolean | undefined>) => SlotPropsT;
export default addSlotAttributes;

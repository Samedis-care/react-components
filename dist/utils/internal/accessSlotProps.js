const accessSlotProps = (state, slotProps) => {
    if (slotProps == null)
        return undefined;
    if (typeof slotProps === "function")
        return slotProps(state);
    return slotProps;
};
export default accessSlotProps;

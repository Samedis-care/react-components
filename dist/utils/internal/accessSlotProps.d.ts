declare const accessSlotProps: <T, R extends object>(state: T, slotProps: undefined | null | R | ((state: T) => R)) => R | undefined;
export default accessSlotProps;

/**
 * The HTML attributes for the frame of CrudFileUpload or CrudMultiImage: the ones passed
 * in, described by the write error shown next to the field as well
 * @param frameProps The attributes passed in through `slotProps`
 * @param errorId The id of the write error shown next to the field, if one is
 * @returns The attributes, with the error added to `aria-describedby`
 */
const describeFrameBy = (frameProps, errorId) => ({
    ...frameProps,
    "aria-describedby": [frameProps?.["aria-describedby"], errorId].filter(Boolean).join(" ") ||
        undefined,
});
export default describeFrameBy;

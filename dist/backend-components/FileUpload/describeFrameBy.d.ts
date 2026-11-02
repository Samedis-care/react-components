import { GroupBoxHTMLProps } from "../../standalone/GroupBox";
/**
 * The HTML attributes for the frame of CrudFileUpload or CrudMultiImage: the ones passed
 * in, described by the write error shown next to the field as well
 * @param frameProps The attributes passed in through `slotProps`
 * @param errorId The id of the write error shown next to the field, if one is
 * @returns The attributes, with the error added to `aria-describedby`
 */
declare const describeFrameBy: (frameProps: GroupBoxHTMLProps | undefined, errorId: string | undefined) => GroupBoxHTMLProps;
export default describeFrameBy;

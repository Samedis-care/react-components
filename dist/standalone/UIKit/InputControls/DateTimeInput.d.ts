import React from "react";
import { UIInputProps } from "../CommonStyles";
export interface DateTimeInputProps extends UIInputProps {
    openInfo?: () => void;
}
declare const _default: React.MemoExoticComponent<(props: DateTimeInputProps & import("@material-ui/pickers/_helpers/text-field-helper").DateValidationProps & import("@material-ui/pickers/typings/BasePicker").BasePickerProps & {
    variant?: import("@material-ui/pickers/wrappers/Wrapper").WrapperVariant | undefined;
} & import("@material-ui/pickers/wrappers/Wrapper").ModalRoot & import("@material-ui/pickers/wrappers/Wrapper").InlineRoot & import("@material-ui/pickers/_helpers/utils").Omit<import("@material-ui/pickers/_shared/PureDateInput").PureDateInputProps, import("@material-ui/pickers/_shared/PureDateInput").NotOverridableProps> & import("@material-ui/pickers").DateTimePickerViewsProps) => JSX.Element>;
export default _default;

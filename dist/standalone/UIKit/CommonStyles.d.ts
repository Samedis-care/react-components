import { Theme } from "@mui/material/styles";
import { Styles } from "@mui/styles";
import { InputClassKey, InputLabelProps } from "@mui/material";
import { ClassNameMap } from "@mui/styles/withStyles";
export interface UIInputProps {
    important?: boolean;
    warning?: boolean;
}
export type InputTheme = Partial<Styles<Theme, UIInputProps, InputClassKey>>;
export declare const useInputStyles: (props: UIInputProps) => Partial<ClassNameMap<InputClassKey>>;
export declare const InputLabelConfig: InputLabelProps;

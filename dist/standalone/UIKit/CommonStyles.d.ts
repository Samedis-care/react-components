import { Theme } from "@material-ui/core/styles";
import { InputClassKey, InputLabelProps } from "@material-ui/core";
import { Styles } from "@material-ui/core/styles/withStyles";
import { ClassNameMap } from "@material-ui/styles/withStyles";
export interface UIInputProps {
    important?: boolean;
    warning?: boolean;
}
export declare type InputTheme = Partial<Styles<Theme, UIInputProps, InputClassKey>>;
export declare const useInputStyles: (props: UIInputProps) => Partial<ClassNameMap<InputClassKey>>;
export declare const InputLabelConfig: InputLabelProps;

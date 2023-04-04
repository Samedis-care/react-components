import { Theme } from "@material-ui/core";
import { Styles } from "@material-ui/core/styles/withStyles";
import { ClassNameMap } from "@material-ui/styles/withStyles";
/**
 * Calls makeStyles based on values from theme
 * @param getSubStyles A function to extract the values from the theme which should be used in makeStyles
 * @param name The name for the styles
 * @param useParentStyles The parent styles to override with theme styles
 */
declare const makeThemeStyles: <Props extends object, ClassKey extends string = string>(getSubStyles: (theme: Theme) => Partial<Styles<Theme, Props, ClassKey>> | undefined, name: string, useParentStyles?: ((props?: any) => ClassNameMap<string>) | undefined) => keyof Props extends never ? (props?: unknown) => ClassNameMap<ClassKey> : (props: Props) => ClassNameMap<ClassKey>;
export default makeThemeStyles;

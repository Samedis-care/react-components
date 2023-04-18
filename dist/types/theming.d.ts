import { CSSProperties } from "@mui/styles";
export interface BasicThemeFragment {
    display?: CSSProperties["display"];
    borderColor?: CSSProperties["borderColor"];
    borderWidth?: CSSProperties["borderWidth"];
    borderStyle?: CSSProperties["borderStyle"];
    border?: CSSProperties["border"];
    borderRadius?: CSSProperties["borderRadius"];
    margin?: CSSProperties["margin"];
    padding?: CSSProperties["padding"];
    background?: CSSProperties["background"];
    backgroundColor?: CSSProperties["backgroundColor"];
    style?: CSSProperties;
}
export interface BasicColorThemeFragment {
    borderColor?: CSSProperties["borderColor"];
    background?: CSSProperties["background"];
    backgroundColor?: CSSProperties["backgroundColor"];
    color?: CSSProperties["color"];
    style?: CSSProperties;
}
export interface BasicElementThemeFragment extends BasicThemeFragment {
    width?: CSSProperties["width"];
    height?: CSSProperties["height"];
}
export interface BasicTextThemeFragment extends BasicThemeFragment {
    fontSize?: CSSProperties["fontSize"];
    fontWeight?: CSSProperties["fontWeight"];
    fontStyle?: CSSProperties["fontStyle"];
    textDecoration?: CSSProperties["textDecoration"];
    color?: CSSProperties["color"];
}
export interface BasicIconThemeFragment extends BasicThemeFragment {
    color?: CSSProperties["color"];
}
export interface BasicButtonThemeFragment extends BasicThemeFragment {
    container?: BasicElementThemeFragment;
    hover?: BasicColorThemeFragment;
    disabled?: BasicColorThemeFragment;
    label?: BasicTextThemeFragment;
    icon?: BasicIconThemeFragment;
}
export interface BasicInputThemeFragment extends BasicThemeFragment {
    container?: BasicElementThemeFragment;
    active?: BasicColorThemeFragment;
    disabled?: BasicColorThemeFragment;
    label?: BasicTextThemeFragment;
    placeholder?: BasicTextThemeFragment;
    icon?: BasicIconThemeFragment;
}

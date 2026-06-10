import React from "react";
import type { IFrameworkProps } from "./Framework";
import { ThemeOptions } from "@mui/material";
export type SetThemeAction = (theme: ThemeOptions) => void;
export type GetDefaultThemeCallback = (preferDark: boolean) => ThemeOptions;
export declare const getStandardTheme: GetDefaultThemeCallback;
export interface IThemeProviderProps extends IFrameworkProps {
    /**
     * Provides the default Theme
     */
    defaultTheme: GetDefaultThemeCallback;
}
/**
 * Context for the dialog state
 */
export declare const ThemeContext: React.Context<SetThemeAction | undefined>;
declare const _default: React.MemoExoticComponent<(props: IThemeProviderProps) => React.JSX.Element>;
export default _default;

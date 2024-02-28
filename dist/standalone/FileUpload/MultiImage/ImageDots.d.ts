import React from "react";
import { Theme } from "@mui/material";
import { Styles } from "@mui/styles";
import { ClassNameMap } from "@mui/styles/withStyles";
export interface ImageDotsProps {
    /**
     * Total number of images
     */
    total: number;
    /**
     * Currently active image
     */
    active: number;
    /**
     * Set currently active image
     * @param active Image index
     */
    setActive: (active: number) => void;
    /**
     * Optional style overrides
     */
    classes?: Partial<ClassNameMap<keyof ReturnType<typeof useStyles>>>;
}
declare const useStyles: (props?: any) => ClassNameMap<"activeImageDot" | "imageDot" | "imageDotContainerContainer" | "imageDotContainer">;
export type ImageDotsClassKey = keyof ReturnType<typeof useStyles>;
export type ImageDotsTheme = Partial<Styles<Theme, ImageDotsProps, ImageDotsClassKey>>;
declare const _default: React.MemoExoticComponent<(props: ImageDotsProps) => JSX.Element>;
export default _default;

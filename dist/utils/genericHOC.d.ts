import { Theme } from "@mui/material";
import { WithStyles } from "@mui/styles";
export declare type GenericWithStyles<T extends WithStyles<any, any>> = Omit<T, "theme" | "classes"> & {
    classes?: T["classes"];
} & ("theme" extends keyof T ? {
    theme?: Theme;
} : Record<string, unknown>);

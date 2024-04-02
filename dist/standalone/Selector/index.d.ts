import type * as Theming from "../../types/theming";
export * from "./BaseSelector";
export { default as BaseSelector } from "./BaseSelector";
export * from "./SingleSelect";
export { default as SingleSelect } from "./SingleSelect";
export * from "./MultiSelect";
export { default as MultiSelect } from "./MultiSelect";
export { default as MultiSelectEntry } from "./MultiSelectEntry";
export * from "./MultiSelectWithTags";
export { default as MultiSelectWithTags } from "./MultiSelectWithTags";
export * from "./MultiSelectWithoutGroup";
export { default as MultiSelectWithoutGroup } from "./MultiSelectWithoutGroup";
export interface SelectorTheme extends Theming.BasicInputThemeFragment {
    outer?: Theming.BasicElementThemeFragment;
    buttonClear?: Theming.BasicElementThemeFragment & {
        icon?: Theming.BasicIconThemeFragment;
    };
    buttonToggle?: Theming.BasicButtonThemeFragment;
    option?: Theming.BasicButtonThemeFragment & {
        checkbox?: Theming.BasicElementThemeFragment & {
            icon?: Theming.BasicIconThemeFragment;
        };
    };
    selected?: Theming.BasicButtonThemeFragment & {
        buttonRemove?: Theming.BasicButtonThemeFragment;
    };
    selectedTags?: Theming.BasicButtonThemeFragment & {
        buttonRemove?: Theming.BasicButtonThemeFragment;
    };
    search?: Theming.BasicInputThemeFragment & {
        buttonHelp: Theming.BasicButtonThemeFragment;
    };
}

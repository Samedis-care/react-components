import type * as Theming from "../../types/theming";

export * from "./Selector";
export { default as Selector } from "./Selector";
export * from "./BaseSelector";
export { default as BaseSelector } from "./BaseSelector";
export * from "./SingleSelect";
export { default as SingleSelect } from "./SingleSelect";
export * from "./MultiSelect";
export { default as MultiSelect } from "./MultiSelect";
export { default as MultiSelectEntry } from "./MultiSelectEntry";
export * from "./MultiSelectWithCheckBox";
export { default as MultiSelectWithCheckBox } from "./MultiSelectWithCheckBox";
export * from "./MultiSelectWithTags";
export { default as MultiSelectWithTags } from "./MultiSelectWithTags";

export interface SelectorTheme extends Theming.BasicInputThemeFragment {
	/* root elements from BasicInputThemeFragment defining main select (closed) visuals */

	/* wrapper around the whole control */
	outer?: Theming.BasicElementThemeFragment;

	/* the button that allows clearing any typed text */
	buttonClear?: Theming.BasicElementThemeFragment & {
		/* the clear (x) button */
		icon?: Theming.BasicIconThemeFragment;
	};

	/* the button that allows toggling the list of options  */
	buttonToggle?: Theming.BasicButtonThemeFragment;

	/* the list of available options when opened */
	option?: Theming.BasicButtonThemeFragment & {
		/* the checkbox control if a multi-select uses checkboxes  */
		checkbox?: Theming.BasicElementThemeFragment & {
			/* the checkbox icon */
			icon?: Theming.BasicIconThemeFragment;
		};
	};

	/* the list of selected values (displayed below, when not using tags) */
	selected?: Theming.BasicButtonThemeFragment & {
		/* the button to remove (usually with a trash can icon) */
		buttonRemove?: Theming.BasicButtonThemeFragment;
	};

	/* the tag gridlist of selected values (displayed below) */
	selectedTags?: Theming.BasicButtonThemeFragment & {
		/* the button to remove (usually with a trash can icon) */
		buttonRemove?: Theming.BasicButtonThemeFragment;
	};

	/* the search field when used in tandem with a group selector */
	search?: Theming.BasicInputThemeFragment & {
		/* the optional help (i) button at the right end */
		buttonHelp: Theming.BasicButtonThemeFragment;
	};
}

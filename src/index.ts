import {
	MultiSelectWithCheckBoxTheme,
	SelectorTheme,
	SelectorThemeExpert,
} from "./standalone";
import { DataGridTheme, DataGridThemeExpert } from "./standalone/DataGrid";
import { MenuTheme } from "./standalone/Portal/Menu";
import { MenuItemTheme } from "./standalone/Portal/MenuItem/Material";
import { ActionButtonTheme } from "./standalone/UIKit/ActionButton";
import { CheckboxTheme } from "./standalone/UIKit/Checkbox";
import { InputTheme } from "./standalone/UIKit/CommonStyles";
import { ComponentWithLabelTheme } from "./standalone/UIKit/ComponentWithLabel";
import { FormButtonTheme } from "./standalone/UIKit/FormButtons";
import { SubActionButtonTheme } from "./standalone/UIKit/SubActionButton";

export * from "./standalone";

export * from "./framework";

export * from "./non-standalone";

export * from "./backend-integration";

export * from "./backend-components";

export { default as ComponentsCareI18n } from "./i18n";

export * from "./utils";

export interface ComponentsCareTheme {
	dataGrid?: DataGridTheme;
	dataGridExpert?: DataGridThemeExpert;
	portal?: {
		menu?: MenuTheme;
		menuItem?: MenuItemTheme;
	};
	selector?: SelectorTheme;
	selectorWithCheckbox?: MultiSelectWithCheckBoxTheme;
	uiKit?: {
		label?: ComponentWithLabelTheme;
		checkbox?: CheckboxTheme;
		input?: InputTheme;
		actionButton?: ActionButtonTheme;
		subActionButton?: SubActionButtonTheme;
		formButtons?: FormButtonTheme;
		baseSelectorExpert?: SelectorThemeExpert;
	};
}

declare module "@material-ui/core/styles/createMuiTheme" {
	interface Theme {
		componentsCare?: ComponentsCareTheme;
	}
	interface ThemeOptions {
		componentsCare?: ComponentsCareTheme;
	}
}

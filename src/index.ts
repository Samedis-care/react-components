import { DataGridTheme } from "./standalone/DataGrid";
import { ActionButtonTheme } from "./standalone/UIKit/ActionButton";
import { CheckboxTheme } from "./standalone/UIKit/Checkbox";
import { InputTheme } from "./standalone/UIKit/CommonStyles";
import { FormButtonTheme } from "./standalone/UIKit/FormButtons";

export * from "./standalone";

export * from "./framework";

export * from "./non-standalone";

export * from "./backend-integration";

export * from "./backend-components";

export { default as ComponentsCareI18n } from "./i18n";

export * from "./utils";

interface ComponentsCareTheme {
	dataGrid?: DataGridTheme;
	uiKit?: {
		checkbox?: CheckboxTheme;
		input?: InputTheme;
		actionButton?: ActionButtonTheme;
		formButtons?: FormButtonTheme;
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

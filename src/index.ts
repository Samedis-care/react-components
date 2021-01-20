import { DataGridTheme } from "./standalone/DataGrid";

export * from "./standalone";

export * from "./framework";

export * from "./non-standalone";

export * from "./backend-integration";

export * from "./backend-components";

export { default as ComponentsCareI18n } from "./i18n";

export * from "./utils";

interface ComponentsCareTheme {
	dataGrid?: DataGridTheme;
}

declare module "@material-ui/core/styles/createMuiTheme" {
	interface Theme {
		componentsCare?: ComponentsCareTheme;
	}
	interface ThemeOptions {
		componentsCare?: ComponentsCareTheme;
	}
}

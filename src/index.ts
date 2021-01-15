import { CSSProperties } from "react";

export * from "./standalone";

export * from "./framework";

export * from "./non-standalone";

export * from "./backend-integration";

export * from "./backend-components";

export { default as ComponentsCareI18n } from "./i18n";

export * from "./utils";

declare module "@material-ui/core/styles/createMuiTheme" {
	interface Theme {
		componentsCare?: {
			dataGrid?: {
				content?: {
					headerBackgroundColor?: CSSProperties["backgroundColor"];
					columnDividerColor?: CSSProperties["borderColor"];
					backgroundColor?: CSSProperties["backgroundColor"];
					dividerColor?: CSSProperties["borderColor"];
					hoverBackgroundColor?: CSSProperties["backgroundColor"];
				};
			};
		};
	}
	interface ThemeOptions {
		componentsCare?: {
			dataGrid?: {
				content?: {
					headerBackgroundColor?: CSSProperties["backgroundColor"];
					columnDividerColor?: CSSProperties["borderColor"];
					backgroundColor?: CSSProperties["backgroundColor"];
					dividerColor?: CSSProperties["borderColor"];
					hoverBackgroundColor?: CSSProperties["backgroundColor"];
				};
			};
		};
	}
}

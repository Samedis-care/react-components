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
			portal?: {
				header?: {
					backgroundColor?: CSSProperties["backgroundColor"];
					height?: CSSProperties["height"];
				};
				menu?: {
					width?: CSSProperties["width"];
					widthCollapsed?: CSSProperties["width"];
					padding?: CSSProperties["padding"];
					color?: CSSProperties["color"];
					backgroundColor?: CSSProperties["backgroundColor"];
					hover?: {
						fontWeight?: CSSProperties["fontWeight"];
						color?: CSSProperties["color"];
						backgroundColor?: CSSProperties["backgroundColor"];
					};
					selected?: {
						borderRadius?: CSSProperties["borderRadius"];
						fontWeight?: CSSProperties["fontWeight"];
						color?: CSSProperties["color"];
						backgroundColor?: CSSProperties["backgroundColor"];
					};
				};
			};
		};
	}
	interface ThemeOptions {
		componentsCare?: {
			portal?: {
				header?: {
					backgroundColor?: CSSProperties["backgroundColor"];
					height?: CSSProperties["height"];
				};
				menu?: {
					width?: CSSProperties["width"];
					widthCollapsed?: CSSProperties["width"];
					padding?: CSSProperties["padding"];
					color?: CSSProperties["color"];
					backgroundColor?: CSSProperties["backgroundColor"];
					hover?: {
						fontWeight?: CSSProperties["fontWeight"];
						color?: CSSProperties["color"];
						backgroundColor?: CSSProperties["backgroundColor"];
					};
					selected?: {
						borderRadius?: CSSProperties["borderRadius"];
						fontWeight?: CSSProperties["fontWeight"];
						color?: CSSProperties["color"];
						backgroundColor?: CSSProperties["backgroundColor"];
					};
				};
			};
		};
	}
}

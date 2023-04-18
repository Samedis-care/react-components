import React from "react";
import {
	Checkbox as MuiCheckbox,
	SvgIcon,
	CheckboxProps,
	Theme,
} from "@mui/material";

import { withStyles, CSSProperties } from "@mui/styles";

export interface CheckboxTheme {
	padding?: CSSProperties["padding"];
	margin?: CSSProperties["margin"];
	border?: CSSProperties["border"];
	borderRadius?: CSSProperties["borderRadius"];
	backgroundColor?: CSSProperties["backgroundColor"];
	fontSize?: CSSProperties["fontSize"];
	style?: CSSProperties;

	small?: {
		fontSize?: CSSProperties["fontSize"];
		style?: CSSProperties;
	};
	hover?: {
		backgroundColor?: CSSProperties["backgroundColor"];
		border?: CSSProperties["border"];
		style?: CSSProperties;
	};
	disabled?: {
		box?: {
			color?: CSSProperties["color"];
			fill?: CSSProperties["fill"];
			style?: CSSProperties;
		};
		backgroundColor?: CSSProperties["backgroundColor"];
		style?: CSSProperties;
	};
	box?: {
		small?: {
			style?: CSSProperties;
		};
		borderWidth?: CSSProperties["borderWidth"];
		borderStyle?: CSSProperties["borderStyle"];
		borderColor?: CSSProperties["borderColor"];
		borderRadius?: CSSProperties["borderRadius"];
		color?: CSSProperties["color"];
		fill?: CSSProperties["fill"];
		backgroundColor?: CSSProperties["backgroundColor"];
		style?: CSSProperties;
	};
}

const StyledCheckbox = withStyles((theme: Theme) => ({
	root: (props: CheckboxProps) => ({
		padding: theme.componentsCare?.uiKit?.checkbox?.padding,
		margin: theme.componentsCare?.uiKit?.checkbox?.margin,
		border: theme.componentsCare?.uiKit?.checkbox?.border,
		borderRadius: theme.componentsCare?.uiKit?.checkbox?.borderRadius,
		backgroundColor: theme.componentsCare?.uiKit?.checkbox?.backgroundColor,
		"& > svg": {
			color: theme.componentsCare?.uiKit?.checkbox?.box?.color,
			fill: theme.componentsCare?.uiKit?.checkbox?.box?.fill,
			fontSize:
				props.size == "small"
					? theme.componentsCare?.uiKit?.checkbox?.small?.fontSize || "1em"
					: theme.componentsCare?.uiKit?.checkbox?.fontSize,
			borderWidth:
				theme.componentsCare?.uiKit?.checkbox?.box?.borderWidth || "1px",
			borderStyle:
				theme.componentsCare?.uiKit?.checkbox?.box?.borderStyle || "solid",
			borderColor:
				theme.componentsCare?.uiKit?.checkbox?.box?.borderColor ||
				theme.palette.divider,
			borderRadius:
				theme.componentsCare?.uiKit?.checkbox?.box?.borderRadius || "2px",
			backgroundColor:
				theme.componentsCare?.uiKit?.checkbox?.box?.backgroundColor ||
				theme.palette.background.paper,
			...(props.size == "small"
				? {
						...theme.componentsCare?.uiKit?.checkbox?.box?.style,
						...theme.componentsCare?.uiKit?.checkbox?.box?.small?.style,
				  }
				: theme.componentsCare?.uiKit?.checkbox?.box?.style),
		},
		...(props.size == "small"
			? {
					...theme.componentsCare?.uiKit?.checkbox?.style,
					...theme.componentsCare?.uiKit?.checkbox?.small?.style,
			  }
			: theme.componentsCare?.uiKit?.checkbox?.style),
	}),
	disabled: {
		backgroundColor:
			theme.componentsCare?.uiKit?.checkbox?.disabled?.backgroundColor,
		"& > svg": {
			color: theme.componentsCare?.uiKit?.checkbox?.disabled?.box?.color,
			fill: theme.componentsCare?.uiKit?.checkbox?.disabled?.box?.fill,
			...theme.componentsCare?.uiKit?.checkbox?.disabled?.box?.style,
		},
		...theme.componentsCare?.uiKit?.checkbox?.disabled?.style,
	},
}))(MuiCheckbox);

const _uncheckedIcon = (
	<SvgIcon viewBox="-3.5 -4.5 24 24">
		<polyline
			id="check"
			fill="transparent"
			stroke="transparent"
			strokeWidth="3.5"
			points="1 7 6 12 16.5 1.5"
		></polyline>
	</SvgIcon>
);
const _checkedIcon = (
	<SvgIcon viewBox="-3.5 -4.5 24 24">
		<polyline
			id="check"
			fill="transparent"
			stroke="currentColor"
			strokeWidth="3.5"
			points="1 7 6 12 16.5 1.5"
		></polyline>
	</SvgIcon>
);

const Checkbox = (props: CheckboxProps) => {
	return (
		<StyledCheckbox
			color="primary"
			icon={_uncheckedIcon}
			checkedIcon={_checkedIcon}
			{...props}
		/>
	);
};

export default React.memo(Checkbox);

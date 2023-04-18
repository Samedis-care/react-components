import React from "react";
import { Button, ButtonProps, Tooltip } from "@mui/material";
import { withStyles, CSSProperties } from "@mui/styles";
import { Theme } from "@mui/material/styles";

export interface SubActionButtonTheme {
	width?: CSSProperties["width"];
	minWidth?: CSSProperties["minWidth"];
	padding?: CSSProperties["padding"];
	margin?: CSSProperties["margin"];
	border?: CSSProperties["border"];
	borderRadius?: CSSProperties["borderRadius"];
	backgroundColor?: CSSProperties["backgroundColor"];
	color?: CSSProperties["color"];
	style?: CSSProperties;
	firstChild?: {
		style?: CSSProperties;
	};
	lastChild?: {
		style?: CSSProperties;
	};
	icon?: {
		marginRight?: CSSProperties["marginRight"];
		color?: CSSProperties["color"];
		style?: CSSProperties;
	};
	hover?: {
		backgroundColor?: CSSProperties["backgroundColor"];
		color?: CSSProperties["color"];
		style?: CSSProperties;
		icon?: {
			color?: CSSProperties["color"];
			style?: CSSProperties;
		};
	};
	small?: {
		width?: CSSProperties["width"];
		minWidth?: CSSProperties["minWidth"];
		padding?: CSSProperties["padding"];
		margin?: CSSProperties["margin"];
		border?: CSSProperties["border"];
		borderRadius?: CSSProperties["borderRadius"];
		backgroundColor?: CSSProperties["backgroundColor"];
		color?: CSSProperties["color"];
		style?: CSSProperties;
		icon?: {
			color?: CSSProperties["color"];
			marginRight: CSSProperties["marginRight"];
			style?: CSSProperties;
		};
		hover?: {
			border?: CSSProperties["border"];
			borderRadius?: CSSProperties["borderRadius"];
			backgroundColor?: CSSProperties["backgroundColor"];
			color?: CSSProperties["color"];
			style?: CSSProperties;
			icon?: {
				color?: CSSProperties["color"];
				style?: CSSProperties;
			};
		};
		firstChild?: {
			style?: CSSProperties;
		};
		lastChild?: {
			style?: CSSProperties;
		};
		disabled?: {
			style?: CSSProperties;
			firstChild?: {
				style?: CSSProperties;
			};
			lastChild?: {
				style?: CSSProperties;
			};
		};
	};
	disabled?: {
		backgroundColor?: CSSProperties["backgroundColor"];
		border?: CSSProperties["border"];
		color?: CSSProperties["color"];
		style?: CSSProperties;
		icon?: {
			style?: CSSProperties;
		};
		firstChild?: {
			style?: CSSProperties;
		};
		lastChild?: {
			style?: CSSProperties;
		};
	};
	label?: {
		justifyContent?: CSSProperties["justifyContent"];
		style?: CSSProperties;
	};
}

const StyledButton = withStyles((theme: Theme) => ({
	root: (props: SubActionButtonPropsForStyles) =>
		props.small
			? {
					borderRadius:
						theme.componentsCare?.uiKit?.subActionButton?.small?.borderRadius,
					backgroundColor:
						theme.componentsCare?.uiKit?.subActionButton?.small
							?.backgroundColor ||
						theme.componentsCare?.uiKit?.subActionButton?.backgroundColor ||
						theme.palette.background.default,
					color:
						theme.componentsCare?.uiKit?.subActionButton?.color ||
						theme.palette.text.primary,
					textTransform: "unset",
					"&:hover": {
						borderRadius:
							theme.componentsCare?.uiKit?.subActionButton?.small?.hover
								?.borderRadius,
						backgroundColor:
							theme.componentsCare?.uiKit?.subActionButton?.hover
								?.backgroundColor ||
							theme.componentsCare?.uiKit?.subActionButton?.small?.hover
								?.backgroundColor ||
							theme.palette.primary.light,
						color:
							theme.componentsCare?.uiKit?.subActionButton?.small?.hover
								?.color ||
							theme.componentsCare?.uiKit?.subActionButton?.hover?.color ||
							theme.palette.primary.main,
						...{
							...theme.componentsCare?.uiKit?.subActionButton?.hover?.style,
							...theme.componentsCare?.uiKit?.subActionButton?.small?.hover
								?.style,
						},
					},
					"&.Mui-disabled": {
						backgroundColor:
							theme.componentsCare?.uiKit?.subActionButton?.disabled
								?.backgroundColor,
						color:
							theme.componentsCare?.uiKit?.subActionButton?.disabled?.color ||
							theme.palette.text.disabled,
						...theme.componentsCare?.uiKit?.subActionButton?.disabled?.style,
					},
					minWidth:
						theme.componentsCare?.uiKit?.subActionButton?.small?.minWidth ||
						"unset",
					padding:
						theme.componentsCare?.uiKit?.subActionButton?.small?.padding ||
						theme.spacing(1),
					...theme.componentsCare?.uiKit?.subActionButton?.small?.style,
			  }
			: {
					padding:
						theme.componentsCare?.uiKit?.subActionButton?.padding ||
						theme.spacing(1, 3),
					borderRadius:
						theme.componentsCare?.uiKit?.subActionButton?.borderRadius || 0,
					backgroundColor:
						theme.componentsCare?.uiKit?.subActionButton?.backgroundColor ||
						theme.palette.background.default,
					color:
						theme.componentsCare?.uiKit?.subActionButton?.color ||
						theme.palette.text.primary,
					textTransform: "unset",
					"&:hover": {
						backgroundColor:
							theme.componentsCare?.uiKit?.subActionButton?.hover
								?.backgroundColor || theme.palette.background.default,
						color:
							theme.componentsCare?.uiKit?.subActionButton?.hover?.color ||
							theme.palette.primary.main,
						...theme.componentsCare?.uiKit?.subActionButton?.hover?.style,
					},
					"&.Mui-disabled": {
						backgroundColor:
							theme.componentsCare?.uiKit?.subActionButton?.disabled
								?.backgroundColor,
						color:
							theme.componentsCare?.uiKit?.subActionButton?.disabled?.color ||
							theme.palette.text.disabled,
						...{
							...theme.componentsCare?.uiKit?.subActionButton?.style,
							...theme.componentsCare?.uiKit?.subActionButton?.disabled?.style,
						},
					},
					minWidth: theme.componentsCare?.uiKit?.subActionButton?.minWidth,
					...theme.componentsCare?.uiKit?.subActionButton?.style,
			  },
	outlined: (props: SubActionButtonPropsForStyles) =>
		props.small
			? {
					"& svg": {
						fill:
							theme.componentsCare?.uiKit?.subActionButton?.small?.color ||
							theme.palette.primary.main,
						...theme.componentsCare?.uiKit?.subActionButton?.small?.icon?.style,
					},
					"&:hover svg": {
						fill:
							theme.componentsCare?.uiKit?.subActionButton?.small?.hover
								?.color || theme.palette.background.default,
						...theme.componentsCare?.uiKit?.subActionButton?.small?.hover?.icon
							?.style,
					},

					borderLeftWidth: 0,
					borderRightWidth: 0,
					borderTopWidth: props.disabledivider ? 0 : undefined,
					borderRadius: 0,
					"&:first-child": {
						borderLeftWidth: 1,
						borderTopLeftRadius:
							theme.componentsCare?.uiKit?.subActionButton?.small?.borderRadius,
						borderBottomLeftRadius:
							theme.componentsCare?.uiKit?.subActionButton?.small?.borderRadius,
						...theme.componentsCare?.uiKit?.subActionButton?.small?.firstChild
							?.style,
					},
					"&:last-child": {
						borderRightWidth: 1,
						borderTopRightRadius:
							theme.componentsCare?.uiKit?.subActionButton?.small?.borderRadius,
						borderBottomRightRadius:
							theme.componentsCare?.uiKit?.subActionButton?.small?.borderRadius,
						...theme.componentsCare?.uiKit?.subActionButton?.small?.lastChild
							?.style,
					},
					"&.Mui-disabled": {
						"& svg": {
							fill:
								theme.componentsCare?.uiKit?.subActionButton?.disabled?.color ||
								theme.palette.text.disabled,
						},
						borderRadiusWidth: 0,
						borderLeftWidth: 0,
						borderRightWidth: 0,
						color:
							theme.componentsCare?.uiKit?.subActionButton?.disabled?.color ||
							theme.palette.text.disabled,
						"&:first-child": {
							borderLeftWidth: 1,
							...theme.componentsCare?.uiKit?.subActionButton?.small?.disabled
								?.firstChild?.style,
						},
						"&:last-child": {
							borderRightWidth: 1,
							...theme.componentsCare?.uiKit?.subActionButton?.small?.disabled
								?.lastChild?.style,
						},
					},
					padding: theme.spacing(2),
			  }
			: {
					"& svg": {
						fill:
							theme.componentsCare?.uiKit?.subActionButton?.icon?.color ||
							theme.componentsCare?.uiKit?.subActionButton?.color ||
							theme.palette.primary.main,
						marginRight:
							theme.componentsCare?.uiKit?.subActionButton?.icon?.marginRight ||
							theme.spacing(3),
						...theme.componentsCare?.uiKit?.subActionButton?.icon?.style,
					},
					"&:hover svg": {
						fill:
							theme.componentsCare?.uiKit?.subActionButton?.hover?.icon?.color,
						...theme.componentsCare?.uiKit?.subActionButton?.hover?.icon?.style,
					},
					borderRadius:
						theme.componentsCare?.uiKit?.subActionButton?.borderRadius,
					borderLeftWidth: 0,
					borderRightWidth: 0,
					borderBottomWidth: 0,
					borderTopWidth: props.disabledivider ? 0 : undefined,
					"&:first-child":
						theme.componentsCare?.uiKit?.subActionButton?.firstChild?.style,
					"&:last-child":
						theme.componentsCare?.uiKit?.subActionButton?.lastChild?.style,
					"&.Mui-disabled": {
						"& svg": {
							fill:
								theme.componentsCare?.uiKit?.subActionButton?.disabled?.color ||
								theme.palette.text.disabled,
							...theme.componentsCare?.uiKit?.subActionButton?.disabled?.icon
								?.style,
						},
						borderLeftWidth: 0,
						borderRightWidth: 0,
						borderBottomWidth: 0,
						border:
							theme.componentsCare?.uiKit?.subActionButton?.disabled?.border ||
							theme.componentsCare?.uiKit?.subActionButton?.border,
						color:
							theme.componentsCare?.uiKit?.subActionButton?.disabled?.color ||
							theme.palette.text.disabled,
						"&:first-child":
							theme.componentsCare?.uiKit?.subActionButton?.disabled?.firstChild
								?.style,
						"&:last-child":
							theme.componentsCare?.uiKit?.subActionButton?.disabled?.lastChild
								?.style,
						...theme.componentsCare?.uiKit?.subActionButton?.disabled?.style,
					},
					padding:
						theme.componentsCare?.uiKit?.subActionButton?.padding ||
						theme.spacing(2, 3),
					...theme.componentsCare?.uiKit?.subActionButton?.style,
			  },
	label: {
		justifyContent:
			theme.componentsCare?.uiKit?.subActionButton?.label?.justifyContent ||
			"flex-start",
		...theme.componentsCare?.uiKit?.subActionButton?.label?.style,
	},
}))(Button);

export interface SubActionButtonProps extends Omit<ButtonProps, "children"> {
	/**
	 * The icon of the button
	 */
	icon?: React.ReactNode;
	/**
	 * Show the compact version of the button (only icon)
	 */
	small?: boolean;
	/**
	 * The text of the button (used for tooltip if small is true)
	 */
	children: NonNullable<React.ReactNode>;
	/**
	 * Flag to disable the top divider
	 */
	disableDivider?: boolean | "true";
}

type SubActionButtonPropsForStyles = Omit<
	SubActionButtonProps,
	"disableDivider"
> & {
	disabledivider?: "true";
};

const SubActionButton = (props: SubActionButtonProps) => {
	const { icon, small, children, disableDivider, ...otherProps } = props;

	const renderButton = (): React.ReactElement => (
		<StyledButton
			variant={"outlined"}
			fullWidth={!small}
			// suppress warning
			disabledivider={disableDivider ? "true" : undefined}
			{...otherProps}
		>
			{icon} {!small && children}
		</StyledButton>
	);

	if (props.disabled || !small) return renderButton();

	return <Tooltip title={children}>{renderButton()}</Tooltip>;
};

export default React.memo(SubActionButton);

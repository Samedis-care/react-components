import React, { useCallback } from "react";
import { Grid, styled, Switch, Typography, useThemeProps } from "@mui/material";
import combineClassNames from "../../utils/combineClassNames";

export interface InlineSwitchProps {
	/**
	 * Value for switch position
	 */
	value: boolean;
	/**
	 * Set value for switch position
	 * @param checked The value of switch input
	 */
	onChange?: (checked: boolean) => void;
	/**
	 * Display switch control?
	 */
	visible: boolean;
	/**
	 * Label for switch control (only used if visible is truthy)
	 */
	label?: React.ReactNode;
	/**
	 * Disables the switch: it cannot be focused or toggled, also not through
	 * its label, `onChange` is not called, and switch and label are greyed out
	 * @default false
	 */
	disabled?: boolean;
	children?: React.ReactElement;
	/**
	 * custom styles
	 */
	className?: string;
	/**
	 * Class names per slot: `root` (the outer div, combined with `className`),
	 * `switchWrapper` (the wrapper of switch and label) and `switch` (the
	 * switch's root, MUI's `.MuiSwitch-root`)
	 */
	classes?: Partial<Record<InlineSwitchClassKey, string>>;
}

const AntSwitch = styled(Switch, { name: "CcInlineSwitch", slot: "switch" })(
	({ theme }) => ({
		width: 35,
		height: 16,
		padding: 0,
		display: "flex",
		// the track fills the root, so the focus ring around it lies outside the root
		overflow: "visible",
		"& .MuiSwitch-switchBase": {
			padding: 2,
			color: theme.palette.grey[500],
			// MUI widens the input past the thumb and lets the root clip it to the
			// track; the root no longer clips, so the input covers just the track
			"& .MuiSwitch-input": { left: 0, width: 35 },
			"&.Mui-checked": {
				transform: "translateX(18px)",
				color: theme.palette.common.white,
				"& .MuiSwitch-input": { left: -18 },
				"& + .MuiSwitch-track": {
					opacity: 1,
					backgroundColor: theme.palette.primary.main,
					borderColor: theme.palette.primary.main,
				},
				// as faint as the unchecked track while disabled, like MUI's Switch
				"&.Mui-disabled + .MuiSwitch-track": {
					opacity: theme.palette.mode === "light" ? 0.12 : 0.2,
				},
			},
			// keyboard focus: with the theme's focusVisible MUI draws its own ring on
			// the track; otherwise this one (MUI's default shows only the focus ripple)
			...(!theme.focusVisible && {
				"&.Mui-focusVisible + .MuiSwitch-track": {
					outline: `2px solid ${(theme.vars || theme).palette.primary.main}`,
					outlineOffset: 2,
				},
			}),
		},
		"& .MuiSwitch-thumb": {
			width: 12,
			height: 12,
			boxShadow: "none",
		},
		"& .MuiSwitch-track": {
			border: `1px solid ${theme.palette.grey[500]}`,
			borderRadius: 16 / 2,
			opacity: 1,
			backgroundColor: theme.palette.common.white,
		},
	}),
);

const StyledRoot = styled("div", { name: "CcInlineSwitch", slot: "root" })({
	marginTop: 15,
});

const StyledSwitchWrapper = styled(Typography, {
	name: "CcInlineSwitch",
	slot: "switchWrapper",
})(({ theme }) => ({
	lineHeight: "30px",
	float: "right",
	"&.CcInlineSwitch-disabled": {
		color: theme.palette.text.disabled,
	},
})) as typeof Typography;

export type InlineSwitchClassKey = "switch" | "root" | "switchWrapper";

const InlineSwitch = (inProps: InlineSwitchProps) => {
	const props = useThemeProps({ props: inProps, name: "CcInlineSwitch" });
	const {
		label,
		value,
		onChange,
		visible,
		disabled,
		children,
		classes,
		className,
	} = props;

	const handleSwitchChange = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			// a click event dispatched on the disabled input by a script can still reach React
			if (disabled) return;
			if (onChange) onChange(event.target.checked);
		},
		[onChange, disabled],
	);

	return (
		<StyledRoot className={combineClassNames([className, classes?.root])}>
			{visible && (
				<StyledSwitchWrapper
					component="div"
					className={combineClassNames([
						classes?.switchWrapper,
						disabled && "CcInlineSwitch-disabled",
					])}
					variant={"caption"}
				>
					<Grid
						component="label"
						container
						sx={{ alignItems: "center" }}
						spacing={1}
					>
						<Grid>
							<AntSwitch
								className={classes?.switch}
								checked={value}
								onChange={handleSwitchChange}
								disabled={disabled}
								// the focus ring shows focus; the ripple would pulse under it endlessly
								disableFocusRipple
							/>
						</Grid>
						<Grid>{label}</Grid>
					</Grid>
				</StyledSwitchWrapper>
			)}
			<div>{children}</div>
		</StyledRoot>
	);
};

export default React.memo(InlineSwitch) as typeof InlineSwitch;

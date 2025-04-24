import React, { useCallback } from "react";
import {
	Grid2 as Grid,
	styled,
	Switch,
	Typography,
	useThemeProps,
} from "@mui/material";
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
	children?: React.ReactElement;
	/**
	 * custom styles
	 */
	className?: string;
	/**
	 * Custom styles
	 */
	classes?: Partial<Record<InlineSwitchClassKey, string>>;
}

const AntSwitch = styled(Switch, { name: "CcInlineSwitch", slot: "switch" })(
	({ theme }) => ({
		width: 35,
		height: 16,
		padding: 0,
		display: "flex",
		"& .MuiSwitch-switchBase": {
			padding: 2,
			color: theme.palette.grey[500],
			"&.Mui-checked": {
				transform: "translateX(18px)",
				color: theme.palette.common.white,
				"& + .MuiSwitch-track": {
					opacity: 1,
					backgroundColor: theme.palette.primary.main,
					borderColor: theme.palette.primary.main,
				},
			},
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
})({
	lineHeight: "30px",
	float: "right",
}) as typeof Typography;

export type InlineSwitchClassKey = "switch" | "root" | "switchWrapper";

const InlineSwitch = (inProps: InlineSwitchProps) => {
	const props = useThemeProps({ props: inProps, name: "CcInlineSwitch" });
	const { label, value, onChange, visible, children, classes, className } =
		props;

	const handleSwitchChange = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			if (onChange) onChange(event.target.checked);
		},
		[onChange],
	);

	return (
		<StyledRoot className={combineClassNames([className, classes?.root])}>
			{visible && (
				<StyledSwitchWrapper
					component="div"
					className={classes?.switchWrapper}
					variant={"caption"}
				>
					<Grid component="label" container alignItems="center" spacing={1}>
						<Grid>
							<AntSwitch checked={value} onChange={handleSwitchChange} />
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

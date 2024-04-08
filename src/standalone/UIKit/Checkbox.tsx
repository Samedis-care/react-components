import React from "react";
import {
	Checkbox as MuiCheckbox,
	CheckboxProps,
	styled,
	SvgIcon,
	useThemeProps,
} from "@mui/material";

const StyledCheckbox = styled(MuiCheckbox, {
	name: "CcCheckbox",
	slot: "root",
})(({ theme }) => ({
	"& > svg": {
		borderWidth: "1px",
		borderStyle: "solid",
		borderColor: theme.palette.divider,
		borderRadius: "2px",
		backgroundColor: theme.palette.background.paper,
	},
}));

export type CheckboxClassKey = "root";

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

const Checkbox = (inProps: CheckboxProps) => {
	const props = useThemeProps({ props: inProps, name: "CcCheckbox" });
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

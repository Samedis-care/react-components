import React from "react";
import {
	Checkbox as MuiCheckbox,
	withStyles,
	SvgIcon,
	CheckboxProps,
} from "@material-ui/core";

import { Theme } from "@material-ui/core/styles";

const StyledCheckbox = withStyles((theme: Theme) => ({
	root: (props: CheckboxProps) => ({
		"& span>svg": {
			fontSize: props.size == "small" ? ".75em" : "1em",
			borderWidth: "1px",
			borderStyle: "solid",
			borderColor: theme.palette.divider,
			borderRadius: "2px",
			backgroundColor: theme.palette.background.paper,
		},
	}),
	colorPrimary: {
		"&$checked": {
			color: theme.palette.primary.main,
		},
		"&$disabled": {
			color: theme.palette.action.disabled,
		},
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

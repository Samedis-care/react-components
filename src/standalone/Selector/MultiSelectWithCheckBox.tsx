import React from "react";
import {
	Select,
	SelectProps,
	withStyles,
	MenuItem,
	Checkbox,
	ListItemText,
	makeStyles,
	Theme,
	InputBase,
	SelectClassKey,
} from "@material-ui/core";
import { ExpandMore } from "@material-ui/icons";
import { MultiSelectOption } from "./TypesMultiSelect";
import { ClassNameMap } from "@material-ui/styles/withStyles";

export interface MultiSelectWithCheckBoxProps extends SelectProps {
	/**
	 * Selector options
	 */
	options: MultiSelectOption[];
	/**
	 * Selected values
	 */
	values: string[];
	/**
	 * Custom styles
	 */
	classes?: Partial<
		ClassNameMap<keyof ReturnType<typeof useStyles> | SelectClassKey>
	>;
}

const useStyles = makeStyles({
	checkboxStyle: {
		borderRadius: 4,
		width: 16,
		height: 16,
		marginRight: 10,
	},
});

const MenuItemCustom = withStyles({
	selected: {
		backgroundColor: "white !important",
		"&:hover": {
			backgroundColor: "rgba(0, 0, 0, 0.04) !important",
		},
	},
})(MenuItem);

const ListItemTextCustom = withStyles({
	primary: {
		fontSize: 13,
	},
})(ListItemText);

const InputCustom = withStyles((theme: Theme) => ({
	input: {
		borderRadius: 4,
		position: "relative",
		backgroundColor: theme.palette.background.paper,
		border: "1px solid #ced4da",
		fontSize: 13,
		padding: 9,
		transition: theme.transitions.create(["border-color", "box-shadow"]),
		"&:focus": {
			borderRadius: 4,
			borderColor: theme.palette.primary.main,
		},
	},
}))(InputBase);

const MultiSelectWithCheckBox = (props: MultiSelectWithCheckBoxProps) => {
	const classes = useStyles(props);
	return (
		<Select
			{...props}
			multiple
			displayEmpty
			value={props.values}
			input={<InputCustom />}
			IconComponent={ExpandMore}
			MenuProps={{
				anchorOrigin: {
					vertical: "bottom",
					horizontal: "left",
				},
				transformOrigin: {
					vertical: "top",
					horizontal: "left",
				},
				getContentAnchorEl: null,
				PaperProps: {
					style: {
						marginTop: 5,
						border: "1px solid #d3d4d5",
					},
				},
			}}
		>
			{props.options.map((option: MultiSelectOption) => {
				return (
					<MenuItemCustom key={option.label} value={option.value}>
						<Checkbox
							checked={props.values.indexOf(option.value) > -1}
							className={classes.checkboxStyle}
						/>
						<ListItemTextCustom primary={option.label} />
					</MenuItemCustom>
				);
			})}
		</Select>
	);
};

export default React.memo(MultiSelectWithCheckBox);

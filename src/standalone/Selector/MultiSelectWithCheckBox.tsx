import React from "react";
import {
	Select,
	SelectProps,
	MenuItem,
	Checkbox,
	ListItemText,
	Theme,
	InputBase,
	SelectClassKey,
	InputLabel,
} from "@mui/material";
import { ExpandMore } from "@mui/icons-material";
import { ClassNameMap } from "@mui/styles/withStyles";
import { cleanClassMap, makeThemeStyles } from "../../utils";
import { makeStyles, withStyles, Styles, CSSProperties } from "@mui/styles";
import { MultiSelectorData } from "./MultiSelect";
import { getStringLabel } from "./BaseSelector";
import uniqueArray from "../../utils/uniqueArray";

export interface MultiSelectWithCheckBoxProps extends SelectProps<string[]> {
	/**
	 * Selector options
	 */
	options: MultiSelectorData[];
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

export interface MultiSelectWithCheckBoxTheme {
	checkboxStyle?: CSSProperties;
	itemSelectedStyle?: CSSProperties;
	itemSelectedHoverStyle?: CSSProperties;
	itemTextPrimaryStyle?: CSSProperties;
	inputStyle?: CSSProperties;
	inputRootStyle?: CSSProperties;
	inputFocusStyle?: CSSProperties;
	selectStyle?: MultiSelectWithCheckBoxThemeExpert;
}

const useStyles = makeStyles(
	(theme) => ({
		checkboxStyle: {
			borderRadius: 4,
			width: 16,
			height: 16,
			marginRight: 10,
			...theme.componentsCare?.selectorWithCheckbox?.checkboxStyle,
		},
		label: {
			marginTop: 1,
		},
	}),
	{ name: "CcMultiSelectWithCheckBox" }
);

const MenuItemCustom = withStyles((theme: Theme) => ({
	selected: {
		backgroundColor: "white !important",
		...theme.componentsCare?.selectorWithCheckbox?.itemSelectedStyle,
		"&:hover": {
			backgroundColor: "rgba(0, 0, 0, 0.04) !important",
			...theme.componentsCare?.selectorWithCheckbox?.itemSelectedHoverStyle,
		},
	},
}))(MenuItem) as typeof MenuItem;

const MenuItemGroup = withStyles({
	root: {
		paddingTop: 0,
		paddingBottom: 0,
	},
})(MenuItem) as typeof MenuItem;

const ListItemTextCustom = withStyles((theme: Theme) => ({
	primary: {
		fontSize: 13,
		...theme.componentsCare?.selectorWithCheckbox?.itemTextPrimaryStyle,
	},
}))(ListItemText) as typeof ListItemText;

const GroupItemText = withStyles((theme: Theme) => ({
	root: {
		...(theme.typography.caption as CSSProperties),
		marginTop: 0,
		marginBottom: 0,
	},
}))(ListItemText) as typeof ListItemText;

const InputCustom = withStyles((theme: Theme) => ({
	root: {
		...theme.componentsCare?.selectorWithCheckbox?.inputRootStyle,
	},
	input: {
		borderRadius: theme.shape.borderRadius,
		position: "relative",
		backgroundColor: theme.palette.background.paper,
		border: "1px solid #ced4da",
		fontSize: 13,
		padding: 8,
		transition: theme.transitions.create(["border-color", "box-shadow"]),
		...theme.componentsCare?.selectorWithCheckbox?.inputStyle,
		"&:focus": {
			borderRadius: theme.shape.borderRadius,
			borderColor: theme.palette.primary.main,
			...theme.componentsCare?.selectorWithCheckbox?.inputFocusStyle,
		},
	},
}))(InputBase) as typeof InputBase;

export type MultiSelectWithCheckBoxThemeExpert = Partial<
	Styles<Theme, SelectProps<string[]>, SelectClassKey>
>;

const useSelectStyles = makeThemeStyles(
	(theme) => ({
		root: {},
		select: {},
		filled: {},
		outlined: {},
		selectMenu: {},
		disabled: {},
		icon: {},
		iconOpen: {},
		iconFilled: {},
		iconOutlined: {},
		...theme?.componentsCare?.selectorWithCheckbox?.selectStyle,
	}),
	"CcMultiSelectWithCheckboxSelect"
);

const MultiSelectWithCheckBox = (props: MultiSelectWithCheckBoxProps) => {
	const { label, options, values, ...selectProps } = props;
	const classes = useStyles(cleanClassMap(props, false, "checkboxStyle"));
	const selectClasses = useSelectStyles(
		cleanClassMap(props, true, "checkboxStyle")
	);
	const groupsEnabled = options.find((opt) => !!opt.group);
	const renderOption = (option: MultiSelectorData) => {
		return (
			<MenuItemCustom key={getStringLabel(option)} value={option.value}>
				<Checkbox
					checked={values.indexOf(option.value) > -1}
					className={classes.checkboxStyle}
				/>
				<ListItemTextCustom primary={option.label} />
			</MenuItemCustom>
		);
	};

	return (
		<>
			{props.label && (
				<InputLabel shrink className={classes.label}>
					{label}
				</InputLabel>
			)}
			<Select
				{...selectProps}
				multiple
				displayEmpty
				classes={selectClasses}
				value={values}
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
					PaperProps: {
						style: {
							marginTop: 5,
							border: "1px solid #d3d4d5",
						},
					},
				}}
			>
				{groupsEnabled
					? (() => {
							const groups = uniqueArray(
								options.map((opt) => opt.group ?? "?" /* handle no group */)
							).sort();
							return groups.map((group) => [
								<MenuItemGroup
									disabled
									value={`group-${group}`}
									key={`group-${group}`}
								>
									<GroupItemText disableTypography primary={group} />
								</MenuItemGroup>,
								...options
									.filter((opt) => opt.group === group)
									.map(renderOption),
							]);
					  })()
					: options.map(renderOption)}
			</Select>
		</>
	);
};

export default React.memo(MultiSelectWithCheckBox);

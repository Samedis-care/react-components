import React, { CSSProperties } from "react";
import Selector, { SelectorData, SelectorPropsSingleSelect } from "./Selector";
import SingleSelect from "./Selector";
import { TextField, TextFieldProps, Tooltip } from "@material-ui/core";
import {
	createStyles,
	Grid,
	Paper,
	Theme,
	useTheme,
	withStyles,
	WithStyles,
} from "@material-ui/core";
import { SmallIconButton, SmallListItemIcon } from "../Small/List";
import {
	RemoveCircle as DeleteIcon,
	Search as SearchIcon,
	Info as InfoIcon,
} from "@material-ui/icons";
import { Autocomplete } from "@material-ui/lab";
import { ControlProps } from "react-select/src/components/Control";
import { GenericWithStyles } from "../../utils";

export interface MultiSelectData extends SelectorData {
	/**
	 * Item click handler
	 */
	onClick?: () => void;
	/**
	 * Can the entry be unselected?
	 * @param data The data entry to be unselected
	 */
	canUnselect?: (data: MultiSelectData) => boolean | Promise<boolean>;
}

export interface MultiSelectWithTagsProps<Data extends MultiSelectData>
	extends Omit<
		SelectorPropsSingleSelect<Data>,
		"multiSelect" | "clearable" | "onSelect" | "selected"
	> {
	/**
	 * Extended selection change handler
	 * @param data The selected data entry/entries
	 */
	onSelect?: (value: Data[]) => void;
	onGroupSelect?: (value: SelectorData | null) => void;
	/**
	 * The title of control
	 */
	title: string;
	/**
	 * The currently selected values
	 */
	selected: Data[];
	filteredData: Data[];
	/**
	 * The currently selected groups
	 */
	selectedGroup: SelectorData | null;
	onGroupLoad: (search: string) => Data[] | Promise<Data[]>;
}

const styles = createStyles((theme: Theme) => ({
	paperWrapper: {
		boxShadow: "none",
		border: `1px solid ${theme.palette.divider}`,
	},
	outlined: {
		float: "left",
		backgroundColor: "#cce1f6",
		padding: "0px 20px",
		borderRadius: 20,
		borderColor: "#cce1f6",
		margin: "5px",
	},
	selectedEntries: {},
}));

const MultiSelectWithTags = <Data extends MultiSelectData>(
	props: MultiSelectWithTagsProps<Data> & WithStyles
) => {
	const {
		title,
		onLoad,
		onSelect,
		selected,
		filteredData,
		onGroupLoad,
		onGroupSelect,
		selectedGroup,
		enableIcons,
		customStyles,
		disable,
		classes,
	} = props;
	const theme = useTheme();

	const multiSelectHandler = React.useCallback(
		(value: string) => {
			if (!value) return;
			if (onSelect) {
				onSelect([
					...selected,
					selected.filter((option) =>
						option.label.toLowerCase().includes(value.toLowerCase())
					)[0],
				]);
			}
		},
		[onSelect, selected]
	);

	const groupSelectLoadHandler = React.useCallback(
		async (query: string) => {
			const results = await onGroupLoad(query);
			return results.filter((option) =>
				option.label.toLowerCase().includes(query.toLowerCase())
			);
		},
		[onGroupLoad]
	);

	const multiSelectLoadHandler = React.useCallback(
		async (query: string) => {
			const results = await onLoad(query);
			return results.filter(
				(val: SelectorData) => !selected.map((s) => s.value).includes(val.value)
			);
		},
		[onLoad, selected]
	);

	const handleDelete = React.useCallback(
		(evt: React.MouseEvent<HTMLButtonElement>) => {
			let canDelete = true;
			const entry: Data | null | undefined = selected.find(
				(s) => s.value === evt.currentTarget.name
			);
			if (!entry) {
				throw new Error(
					"[Components-Care] [MultiSelect] Entry couldn't be found. Either entry.value is not set, or the entity renderer does not correctly set the name attribute"
				);
			}
			void (async () => {
				if (entry.canUnselect) {
					canDelete = await entry.canUnselect(entry);
				}
				if (canDelete && onSelect)
					onSelect(selected.filter((s) => s.value !== entry.value));
			})();
		},
		[onSelect, selected]
	);

	const selectorStyles = React.useMemo(() => {
		const { control, ...otherCustomStyles } = customStyles || {};
		return {
			control: (
				base: CSSProperties,
				// eslint-disable-next-line @typescript-eslint/ban-types
				selectProps: ControlProps<object, false>
			): CSSProperties => {
				let multiSelectStyles: CSSProperties = {
					...base,
					borderRadius: 0,
					border: "none",
					borderBottom: `1px solid ${theme.palette.divider}`,
					boxShadow: "none",
					backgroundColor: "transparent",
				};

				if (control)
					multiSelectStyles = control(multiSelectStyles, selectProps);

				return multiSelectStyles;
			},
			...otherCustomStyles,
		};
	}, [customStyles, theme]);

	return (
		<div>
			<h3>{title}</h3>
			<SingleSelect
				selected={selectedGroup}
				onSelect={onGroupSelect}
				onLoad={groupSelectLoadHandler}
				clearable={true}
				disable={disable}
				multiSelect={false}
			/>

			<Autocomplete
				freeSolo
				id="free-solo-2-demo"
				disableClearable
				options={filteredData.map((option) => option.label)}
				onChange={(_event, newValue) => multiSelectHandler(newValue)}
				renderInput={(params: TextFieldProps) => (
					<TextField
						{...params}
						label="Search input"
						margin="normal"
						InputProps={{
							...params.InputProps,
							startAdornment: <SearchIcon color={"primary"} />,
							type: "search",
							endAdornment: (
								<Tooltip title="infoText">
									<InfoIcon color={"disabled"} />
								</Tooltip>
							),
						}}
					/>
				)}
			/>
			{selected.map((data: MultiSelectData, index: number) => (
				<div key={index} className={classes.outlined}>
					{enableIcons && <SmallListItemIcon>{data.icon}</SmallListItemIcon>}
					<span>{data.label}</span>
					<SmallIconButton
						edge={"end"}
						name={data.value}
						disabled={disable}
						onClick={disable ? undefined : handleDelete}
					>
						<DeleteIcon />
					</SmallIconButton>
				</div>
			))}
		</div>
	);
};

const StylesMultiSelectWithTags = withStyles(styles)(
	React.memo(MultiSelectWithTags)
) as <Data extends MultiSelectData>(
	props: GenericWithStyles<MultiSelectWithTagsProps<Data> & WithStyles>
) => React.ReactElement;

export default StylesMultiSelectWithTags;

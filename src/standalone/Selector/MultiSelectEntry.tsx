import React from "react";
import {
	Divider,
	List,
	ListItemSecondaryAction,
	ListItemText,
	Theme,
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import {
	SmallIconButton,
	SmallListItemButton,
	SmallListItemIcon,
} from "../Small";
import { MultiSelectorData } from "./MultiSelect";
import { ClassNameMap } from "@mui/styles/withStyles";
import { Cancel as RemoveIcon } from "@mui/icons-material";
import { combineClassNames } from "../../utils";

export interface IMultiSelectEntryProps<DataT extends MultiSelectorData> {
	/**
	 * Should we show icons?
	 */
	enableIcons?: boolean;
	/**
	 * The size of the icons
	 */
	iconSize?: number;
	/**
	 * Should we render a divider below
	 */
	enableDivider: boolean;
	/**
	 * Delete handler (if undefined hide/disable delete button)
	 * @param evt
	 */
	handleDelete?: (evt: React.MouseEvent<HTMLButtonElement>) => void;
	/**
	 * The data entry to render
	 */
	data: DataT;
	/**
	 * Sets the data for this entry
	 * @remarks The data.value identifies the entry to be changed
	 */
	setData: (newValue: DataT) => void;
}

const useStyles = makeStyles(
	(theme: Theme) => ({
		root: {},
		divider: {},
		container: {
			border: theme.componentsCare?.selector?.selected?.container?.border,
			borderRadius:
				theme.componentsCare?.selector?.selected?.container?.borderRadius,
			margin: theme.componentsCare?.selector?.selected?.container?.margin,
			padding: theme.componentsCare?.selector?.selected?.container?.padding,
			backgroundColor:
				theme.componentsCare?.selector?.selected?.container?.backgroundColor,
			...theme.componentsCare?.selector?.selected?.container?.style,
		},
		selected: {
			border: theme.componentsCare?.selector?.selected?.border,
			borderRadius: theme.componentsCare?.selector?.selected?.borderRadius,
			margin: theme.componentsCare?.selector?.selected?.margin,
			padding: theme.componentsCare?.selector?.selected?.padding,
			backgroundColor:
				theme.componentsCare?.selector?.selected?.backgroundColor,
			...theme.componentsCare?.selector?.selected?.style,
		},
		unClickable: {
			cursor: "unset",
		},
		ignored: {
			textDecoration: "line-through",
		},
		label: {
			margin: theme.componentsCare?.selector?.selected?.label?.margin,
			padding:
				theme.componentsCare?.selector?.selected?.label?.padding ||
				"0 32px 0 0",
			color: theme.componentsCare?.selector?.selected?.label?.color,
			"& > span": {
				textOverflow: "ellipsis",
				overflow: "hidden",
			},
			...theme.componentsCare?.selector?.selected?.label?.style,
		},
		image: (props: { iconSize?: number }) => ({
			height: props.iconSize ?? 24,
			width: props.iconSize ?? 24,
			objectFit: "contain",
		}),
		icon: {
			...theme.componentsCare?.selector?.selected?.icon?.style,
		},
		iconSvg: {
			fill: theme.componentsCare?.selector?.selected?.icon?.color,
		},
	}),
	{ name: "CcMultiSelectEntry" },
);

const MultiSelectEntry = <DataT extends MultiSelectorData>(
	props: IMultiSelectEntryProps<DataT> & {
		classes?: ClassNameMap<keyof ReturnType<typeof useStyles>>;
	},
) => {
	const { enableIcons, enableDivider, handleDelete, data } = props;
	const classes = useStyles(props);

	return (
		<>
			<List className={combineClassNames([classes.root, classes.container])}>
				<SmallListItemButton
					onClick={data.onClick}
					className={combineClassNames([
						classes.selected,
						!data.onClick && classes.unClickable,
						data.ignore && classes.ignored,
					])}
					disableRipple={!data.onClick}
					disableTouchRipple={!data.onClick}
				>
					{enableIcons && (
						<SmallListItemIcon>
							{typeof data.icon === "string" ? (
								<img src={data.icon} alt={""} className={classes.image} />
							) : (
								data.icon
							)}
						</SmallListItemIcon>
					)}
					<ListItemText className={classes.label}>{data.label}</ListItemText>
					{handleDelete && (
						<ListItemSecondaryAction>
							<SmallIconButton
								className={classes.icon}
								edge={"end"}
								name={data.value}
								disabled={!handleDelete}
								onClick={handleDelete}
							>
								<RemoveIcon className={classes.iconSvg} />
							</SmallIconButton>
						</ListItemSecondaryAction>
					)}
				</SmallListItemButton>
			</List>
			{enableDivider && <Divider className={classes.divider} />}
		</>
	);
};

export default React.memo(MultiSelectEntry) as typeof MultiSelectEntry;

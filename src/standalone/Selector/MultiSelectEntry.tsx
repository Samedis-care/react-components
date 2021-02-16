import React from "react";
import {
	Divider,
	List,
	ListItemSecondaryAction,
	ListItemText,
	withStyles,
	createStyles,
	WithStyles,
	makeStyles,
	Theme,
} from "@material-ui/core";
import { SmallIconButton, SmallListItem, SmallListItemIcon } from "../Small";
import { Delete as DeleteIcon } from "@material-ui/icons";
import { MultiSelectorData } from "./MultiSelect";

export interface IMultiSelectEntryProps {
	/**
	 * Should we show icons?
	 */
	enableIcons?: boolean;
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
	data: MultiSelectorData;
}

const styles = createStyles(() => ({
	root: {},
	divider: {},
}));

const useStyles = makeStyles(
	(theme: Theme) => ({
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
		label: {
			margin: theme.componentsCare?.selector?.selected?.label?.margin,
			padding: theme.componentsCare?.selector?.selected?.label?.padding,
			color: theme.componentsCare?.selector?.selected?.label?.color,
			...theme.componentsCare?.selector?.selected?.label?.style,
		},
		icon: {
			...theme.componentsCare?.selector?.selected?.icon?.style,
		},
		iconSvg: {
			fill: theme.componentsCare?.selector?.selected?.icon?.color,
		},
	}),
	{ name: "CcMultiSelectEntry" }
);

const MultiSelectEntry = (props: IMultiSelectEntryProps & WithStyles) => {
	const { enableIcons, enableDivider, handleDelete, data, classes } = props;
	const styleClasses = useStyles(props);

	return (
		<>
			<List className={[classes.root, styleClasses.container].join(" ")}>
				<SmallListItem
					button
					onClick={data.onClick}
					className={styleClasses.selected}
				>
					{enableIcons && <SmallListItemIcon>{data.icon}</SmallListItemIcon>}
					<ListItemText className={styleClasses.label}>
						{data.label}
					</ListItemText>
					<ListItemSecondaryAction>
						<SmallIconButton
							className={styleClasses.icon}
							edge={"end"}
							name={data.value}
							disabled={!handleDelete}
							onClick={handleDelete}
						>
							<DeleteIcon className={styleClasses.iconSvg} />
						</SmallIconButton>
					</ListItemSecondaryAction>
				</SmallListItem>
			</List>
			{enableDivider && <Divider className={classes.divider} />}
		</>
	);
};

export default withStyles(styles)(React.memo(MultiSelectEntry));

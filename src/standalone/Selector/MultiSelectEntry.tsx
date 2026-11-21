import React from "react";
import {
	Chip,
	Divider,
	ListItem,
	ListItemSecondaryAction,
	ListItemText,
	styled,
	useThemeProps,
} from "@mui/material";
import {
	SmallIconButton,
	SmallListItemButton,
	SmallListItemIcon,
} from "../Small";
import { MultiSelectorData } from "./MultiSelect";
import {
	Cancel as RemoveIcon,
	RestoreFromTrash as RestoreIcon,
} from "@mui/icons-material";
import combineClassNames from "../../utils/combineClassNames";
import useCCTranslations from "../../utils/useCCTranslations";

/**
 * A selected entry's change that is not saved yet: "added" to the selection, or "removed"
 * from it
 */
export type MultiSelectChangeState = "added" | "removed";

export interface MultiSelectEntryProps<DataT extends MultiSelectorData> {
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
	 * Removes this entry from the selection, once `data.canUnselect` or MultiSelect's
	 * `confirmDelete` question allows it. It is bound to the entry, so it can be called
	 * from any element's click or key event: a button's `onClick`, a Chip's `onDelete`, a
	 * menu item. Without it the entry must not be removed and has no remove button.
	 * @param evt The click or key event that asks for the removal, passed on to
	 *            `data.canUnselect`; with Shift held it skips the `confirmDelete` question
	 */
	handleDelete?: (evt: React.MouseEvent | React.KeyboardEvent) => void;
	/**
	 * The entry's change that is not saved yet, if any
	 * @remarks Shown as a text after the label ("Added", "Removed"), not by colour alone. A
	 *          removed entry's label is struck through, and instead of the remove button it
	 *          has a restore button (handleRestore).
	 * @default undefined (no pending change)
	 */
	changeState?: MultiSelectChangeState;
	/**
	 * Restore handler of a removed entry (changeState "removed"): its restore button, named
	 * "Restore <label>", takes the place of the remove button. Without it the removed entry
	 * has no button. Bound to the entry like `handleDelete`, so it can be called from any
	 * element.
	 * @param evt The click or key event that asks for the restore
	 */
	handleRestore?: (evt: React.MouseEvent | React.KeyboardEvent) => void;
	/**
	 * The data entry to render
	 */
	data: DataT;
	/**
	 * Sets the data for this entry
	 * @remarks The data.value identifies the entry to be changed
	 */
	setData: (newValue: DataT) => void;
	/**
	 * Custom CSS class to apply to root
	 */
	className?: string;
	/**
	 * Custom CSS classes
	 */
	classes?: Partial<Record<MultiSelectEntryClassKey, string>>;
}

const Root = styled(ListItem, { name: "CcMultiSelectEntry", slot: "root" })({
	// the row spans the whole width, the remove button sits on its end
	paddingLeft: 0,
	paddingRight: 0,
});

export interface MultiSelectEntrySelectedOwnerState {
	unClickable: boolean;
	ignore: boolean;
}
const selectedStyles = ({
	ownerState: { unClickable, ignore },
}: {
	ownerState: MultiSelectEntrySelectedOwnerState;
}) => ({
	...(unClickable && { cursor: "unset" }),
	...(ignore && { textDecoration: "line-through" }),
});
// the row of an entry with onClick
const Selected = styled(SmallListItemButton, {
	name: "CcMultiSelectEntry",
	slot: "selected",
})<{ ownerState: MultiSelectEntrySelectedOwnerState }>(selectedStyles);
// the row of an entry without onClick: laid out like the SmallListItemButton
// of an entry with onClick (MUI's 8px vertical padding, 8px gutters), but no control
const SelectedText = styled("div", {
	name: "CcMultiSelectEntry",
	slot: "selected",
})<{ ownerState: MultiSelectEntrySelectedOwnerState }>((props) => ({
	display: "flex",
	flexGrow: 1,
	alignItems: "center",
	position: "relative",
	minWidth: 0,
	boxSizing: "border-box",
	textAlign: "left",
	padding: 8,
	...selectedStyles(props),
}));

const Label = styled(ListItemText, {
	name: "CcMultiSelectEntry",
	slot: "label",
})({
	padding: "0 32px 0 0",
	"& > span": {
		textOverflow: "ellipsis",
		overflow: "hidden",
	},
	// the change's text follows, and keeps the room for the button
	"&.CcMultiSelectEntry-added, &.CcMultiSelectEntry-removed": {
		paddingRight: 8,
	},
	"&.CcMultiSelectEntry-removed > span": {
		textDecoration: "line-through",
	},
});

// the text of a change that is not saved yet, after the label
const ChangeState = styled(Chip, {
	name: "CcMultiSelectEntry",
	slot: "changeState",
})({
	flexShrink: 0,
	marginRight: 32,
});

const StyledRemoveButton = styled(SmallIconButton, {
	name: "CcMultiSelectEntry",
	slot: "icon",
})({});

const StyledRemoveIcon = styled(RemoveIcon, {
	name: "CcMultiSelectEntry",
	slot: "iconSvg",
})({});

const StyledRestoreIcon = styled(RestoreIcon, {
	name: "CcMultiSelectEntry",
	slot: "restoreIconSvg",
})({});

const StyledDivider = styled(Divider, {
	name: "CcMultiSelectEntry",
	slot: "divider",
})({
	// along the bottom edge of the list item, outside its flex row
	position: "absolute",
	left: 0,
	right: 0,
	bottom: 0,
});

export interface MultiSelectEntryImageOwnerState {
	iconSize?: number;
}
const StyledImage = styled("img", {
	name: "CcMultiSelectEntry",
	slot: "image",
})<{ ownerState: MultiSelectEntryImageOwnerState }>(
	({ ownerState: { iconSize } }) => ({
		height: iconSize ?? 24,
		width: iconSize ?? 24,
		objectFit: "contain",
	}),
);

export type MultiSelectEntryClassKey =
	| "root"
	| "selected"
	| "label"
	| "changeState"
	| "icon"
	| "iconSvg"
	| "restoreIconSvg"
	| "divider"
	| "image";

/**
 * One selected entry of MultiSelect, rendered as a list item (`<li>`, the
 * `root` slot) of the list of selected entries: the row (`selected`) with the
 * optional icon, the label and the text of a change that is not saved yet
 * (`changeState`), and beside it the remove button (`icon`) when `handleDelete`
 * is set, or for a removed entry the restore button when `handleRestore` is set.
 * With `data.onClick` the row is a button, otherwise plain text.
 */
const MultiSelectEntry = <DataT extends MultiSelectorData>(
	inProps: MultiSelectEntryProps<DataT>,
) => {
	const props = useThemeProps({ props: inProps, name: "CcMultiSelectEntry" });
	const { t } = useCCTranslations();
	const {
		enableIcons,
		enableDivider,
		handleDelete,
		changeState,
		handleRestore,
		data,
		classes,
		iconSize,
		className,
	} = props;

	const rowContent = (
		<>
			{enableIcons && (
				<SmallListItemIcon>
					{typeof data.icon === "string" ? (
						<StyledImage
							ownerState={{ iconSize }}
							src={data.icon}
							alt={""}
							className={classes?.image}
						/>
					) : (
						data.icon
					)}
				</SmallListItemIcon>
			)}
			<Label
				className={combineClassNames([
					classes?.label,
					changeState && `CcMultiSelectEntry-${changeState}`,
				])}
			>
				{data.label}
			</Label>
			{changeState && (
				<ChangeState
					size={"small"}
					variant={"outlined"}
					color={changeState === "added" ? "success" : "default"}
					label={t(`standalone.selector.multi-select.change.${changeState}`)}
					className={classes?.changeState}
				/>
			)}
		</>
	);
	// a removed entry is restored where it would be removed: one button, so that the
	// focus stays on it when the entry changes from one to the other
	const restorable = changeState === "removed";
	const handleAction = restorable ? handleRestore : handleDelete;
	const rowOwnerState = { unClickable: !data.onClick, ignore: !!data.ignore };

	return (
		<Root className={combineClassNames([className, classes?.root])}>
			{data.onClick ? (
				<Selected
					ownerState={rowOwnerState}
					onClick={data.onClick}
					className={classes?.selected}
				>
					{rowContent}
				</Selected>
			) : (
				<SelectedText ownerState={rowOwnerState} className={classes?.selected}>
					{rowContent}
				</SelectedText>
			)}
			{handleAction && (
				<ListItemSecondaryAction>
					<StyledRemoveButton
						className={classes?.icon}
						edge={"end"}
						onClick={handleAction}
						aria-label={t(
							restorable
								? "standalone.selector.multi-select.restore-item"
								: "standalone.selector.multi-select.remove-item",
							{ ITEM: data.label },
						)}
					>
						{restorable ? (
							<StyledRestoreIcon className={classes?.restoreIconSvg} />
						) : (
							<StyledRemoveIcon className={classes?.iconSvg} />
						)}
					</StyledRemoveButton>
				</ListItemSecondaryAction>
			)}
			{enableDivider && <StyledDivider className={classes?.divider} />}
		</Root>
	);
};

export default React.memo(MultiSelectEntry) as typeof MultiSelectEntry;

import React from "react";
import {
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
import { Cancel as RemoveIcon } from "@mui/icons-material";
import combineClassNames from "../../utils/combineClassNames";
import useCCTranslations from "../../utils/useCCTranslations";

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
});

const StyledRemoveButton = styled(SmallIconButton, {
	name: "CcMultiSelectEntry",
	slot: "icon",
})({});

const StyledRemoveIcon = styled(RemoveIcon, {
	name: "CcMultiSelectEntry",
	slot: "iconSvg",
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
	"root" | "selected" | "label" | "icon" | "iconSvg" | "divider" | "image";

/**
 * One selected entry of MultiSelect, rendered as a list item (`<li>`, the
 * `root` slot) of the list of selected entries: the row (`selected`) with the
 * optional icon and the label, and beside it the remove button (`icon`) when
 * `handleDelete` is set. With `data.onClick` the row is a button, otherwise
 * plain text.
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
			<Label className={classes?.label}>{data.label}</Label>
		</>
	);
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
			{handleDelete && (
				<ListItemSecondaryAction>
					<StyledRemoveButton
						className={classes?.icon}
						edge={"end"}
						name={data.value}
						disabled={!handleDelete}
						onClick={handleDelete}
						aria-label={t("standalone.selector.multi-select.remove-item", {
							ITEM: data.label,
						})}
					>
						<StyledRemoveIcon className={classes?.iconSvg} />
					</StyledRemoveButton>
				</ListItemSecondaryAction>
			)}
			{enableDivider && <StyledDivider className={classes?.divider} />}
		</Root>
	);
};

export default React.memo(MultiSelectEntry) as typeof MultiSelectEntry;

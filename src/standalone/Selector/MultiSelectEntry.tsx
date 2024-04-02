import React from "react";
import {
	Divider,
	List,
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

const Root = styled(List, { name: "CcMultiSelectEntry", slot: "root" })({});

export interface MultiSelectEntrySelectedOwnerState {
	unClickable: boolean;
	ignore: boolean;
}
const Selected = styled(SmallListItemButton, {
	name: "CcMultiSelectEntry",
	slot: "selected",
})<{ ownerState: MultiSelectEntrySelectedOwnerState }>(
	({ ownerState: { unClickable, ignore } }) => ({
		...(unClickable && { cursor: "unset" }),
		...(ignore && { textDecoration: "line-through" }),
	}),
);

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
})({});

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
	| "icon"
	| "iconSvg"
	| "divider"
	| "image";

const MultiSelectEntry = <DataT extends MultiSelectorData>(
	inProps: MultiSelectEntryProps<DataT>,
) => {
	const props = useThemeProps({ props: inProps, name: "CcMultiSelectEntry" });
	const {
		enableIcons,
		enableDivider,
		handleDelete,
		data,
		classes,
		iconSize,
		className,
	} = props;

	return (
		<>
			<Root className={combineClassNames([className, classes?.root])}>
				<Selected
					ownerState={{ unClickable: !data.onClick, ignore: !!data.ignore }}
					onClick={data.onClick}
					className={classes?.selected}
					disableRipple={!data.onClick}
					disableTouchRipple={!data.onClick}
				>
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
					{handleDelete && (
						<ListItemSecondaryAction>
							<StyledRemoveButton
								className={classes?.icon}
								edge={"end"}
								name={data.value}
								disabled={!handleDelete}
								onClick={handleDelete}
							>
								<StyledRemoveIcon className={classes?.iconSvg} />
							</StyledRemoveButton>
						</ListItemSecondaryAction>
					)}
				</Selected>
			</Root>
			{enableDivider && <StyledDivider className={classes?.divider} />}
		</>
	);
};

export default React.memo(MultiSelectEntry) as typeof MultiSelectEntry;

import React from "react";
import {
	Divider,
	List,
	ListItemSecondaryAction,
	ListItemText,
} from "@material-ui/core";
import {
	SmallIconButton,
	SmallListItem,
	SmallListItemIcon,
} from "../Small/List";
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

const MultiSelectEntry = (props: IMultiSelectEntryProps) => {
	const { enableIcons, enableDivider, handleDelete, data } = props;

	return (
		<>
			<List>
				<SmallListItem button onClick={data.onClick}>
					{enableIcons && <SmallListItemIcon>{data.icon}</SmallListItemIcon>}
					<ListItemText>{data.label}</ListItemText>
					<ListItemSecondaryAction>
						<SmallIconButton
							edge={"end"}
							name={data.value}
							disabled={!handleDelete}
							onClick={handleDelete}
						>
							<DeleteIcon />
						</SmallIconButton>
					</ListItemSecondaryAction>
				</SmallListItem>
			</List>
			{enableDivider && <Divider />}
		</>
	);
};

export default React.memo(MultiSelectEntry);

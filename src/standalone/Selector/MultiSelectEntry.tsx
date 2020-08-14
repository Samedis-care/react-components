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
	enableIcons?: boolean;
	enableDivider: boolean;
	handleDelete: (evt: React.MouseEvent<HTMLButtonElement>) => void;
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

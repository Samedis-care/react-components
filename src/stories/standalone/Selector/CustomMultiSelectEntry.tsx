import React from "react";
import {
	Divider,
	List,
	ListItemSecondaryAction,
	ListItemText,
	TextField,
} from "@material-ui/core";
import {
	SmallIconButton,
	SmallListItem,
	SmallListItemIcon,
} from "../../../standalone/Small";
import { Delete as DeleteIcon } from "@material-ui/icons";
import { IMultiSelectEntryProps } from "../../../standalone/Selector/MultiSelectEntry";

const CustomMultiSelectEntry = (props: IMultiSelectEntryProps) => {
	const { enableIcons, enableDivider, handleDelete, data } = props;

	return (
		<>
			<List>
				<SmallListItem button onClick={data.onClick}>
					{enableIcons && <SmallListItemIcon>{data.icon}</SmallListItemIcon>}
					<ListItemText>
						{data.label}
						<TextField defaultValue={"sample text field"} />
					</ListItemText>
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

export default React.memo(CustomMultiSelectEntry);

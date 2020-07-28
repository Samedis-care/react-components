import React from "react";
import Selector, { SelectorData, SelectorProps } from "./Selector";
import {
	Divider,
	Grid,
	IconButton,
	List,
	ListItem,
	ListItemIcon,
	ListItemSecondaryAction,
	ListItemText,
	Paper,
} from "@material-ui/core";
import { Delete as DeleteIcon } from "@material-ui/icons";

export interface MultiSelectProps<Data extends SelectorData>
	extends Omit<SelectorProps<Data>, "onSelect" | "selected" | "multiSelect"> {
	/**
	 * Simple selection change handler
	 * @param value The selected value
	 */
	onSelect?: (value: Data[]) => void;
	/**
	 * The currently selected value
	 */
	selected: Data[];
}

export default React.memo((props: MultiSelectProps<any>) => {
	const { onLoad, onSelect, selected, enableIcons } = props;

	const multiSelectHandler = React.useCallback(
		(data: any) => {
			if (onSelect) onSelect([...selected, data]);
		},
		[onSelect, selected]
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
			if (onSelect)
				onSelect(selected.filter((s) => s.value !== evt.currentTarget.name));
		},
		[onSelect, selected]
	);

	return (
		<Paper>
			<Grid container>
				<Grid item xs={12}>
					<Selector
						{...props}
						onLoad={multiSelectLoadHandler}
						selected={null}
						onSelect={multiSelectHandler}
						multiSelect={false}
						refreshToken={selected.length.toString()}
					/>
				</Grid>
				<Grid item xs={12}>
					{props.selected.map((data: SelectorData) => (
						<React.Fragment key={data.value}>
							<List>
								<ListItem>
									{enableIcons && <ListItemIcon>{data.icon}</ListItemIcon>}
									<ListItemText>{data.label}</ListItemText>
									<ListItemSecondaryAction>
										<IconButton
											edge={"end"}
											name={data.value}
											onClick={handleDelete}
										>
											<DeleteIcon />
										</IconButton>
									</ListItemSecondaryAction>
								</ListItem>
							</List>
							<Divider />
						</React.Fragment>
					))}
				</Grid>
			</Grid>
		</Paper>
	);
});

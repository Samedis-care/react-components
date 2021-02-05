import React, { useState, useCallback } from "react";
import "../../../i18n";
import { BaseSelectorData, SingleSelect } from "../../../standalone/Selector";
import { colourOptions } from "./Data";
import { action } from "@storybook/addon-actions";
import { boolean, text } from "@storybook/addon-knobs";
import { Box, FormControl, InputLabel } from "@material-ui/core";
import { showInfoDialog } from "../../../non-standalone";
import { useDialogContext } from "../../../framework";

export const SelectorSingle = (): React.ReactElement => {
	const [selected, setSelected] = useState<BaseSelectorData | null>(null);
	const [pushDialog] = useDialogContext();
	const dialogTitle = text("Dialog title", "Sample title");
	const infoText = text(
		"Info Text",
		"This is a pretty long info text which supports html. It really is.<br> It explains you what to write in here."
	);
	const dialogButtonLabel = text("Dialog button label", "Ok");
	const dialogButtonClick = action("onClose");
	const loadDataAction = action("onLoad");
	const onSelectAction = action("onSelect");
	const onAddNewAction = action("onAddNew");
	const enableAddNew = boolean("Enable Add New", false);
	const disableClearable = boolean("Disable clearable?", false);
	const icons = boolean("Enable Icons", false);
	const disabled = boolean("Disable", false);
	const addNewLabel = text("Add new label", "Add");
	const loadingText = text("Loading Text", "Loading..");
	const noOptionsText = text("No options Label", "No Option");
	const placeholderLabel = text("Placeholder Label", "Select..");

	const loadData = useCallback(
		(query: string): BaseSelectorData[] => {
			loadDataAction(query);
			if (query) {
				return colourOptions.filter((option) =>
					option.label.toLowerCase().includes(query.toLowerCase())
				);
			} else return [];
		},
		[loadDataAction]
	);
	const onSelect = useCallback(
		(data: BaseSelectorData | null) => {
			onSelectAction(data);
			setSelected(data);
		},
		[onSelectAction, setSelected]
	);

	return (
		<Box m={2}>
			<FormControl component={"fieldset"} fullWidth>
				<InputLabel shrink>Example selector</InputLabel>
				<SingleSelect
					selected={selected}
					onSelect={onSelect}
					onLoad={loadData}
					onAddNew={enableAddNew ? onAddNewAction : undefined}
					enableIcons={icons}
					disableClearable={disableClearable}
					disabled={disabled}
					addNewLabel={addNewLabel}
					loadingText={loadingText}
					noOptionsText={noOptionsText}
					placeholder={placeholderLabel}
					defaultOptions={colourOptions}
					autocompleteId={"single-select"}
					openInfo={() =>
						showInfoDialog(pushDialog, {
							title: dialogTitle,
							message: (
								<div
									dangerouslySetInnerHTML={{
										__html: infoText,
									}}
								/>
							),
							buttons: [
								{
									text: dialogButtonLabel,
									onClick: dialogButtonClick,
									autoFocus: true,
									color: "primary",
								},
							],
						})
					}
				/>
			</FormControl>
		</Box>
	);
};

SelectorSingle.storyName = "Single";

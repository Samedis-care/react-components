import React, { useState, useCallback } from "react";
import "../../../i18n";
import {
	BaseSelectorData,
	SelectorLruOptions,
	SingleSelect,
} from "../../../standalone/Selector";
import { colourOptions } from "./Data";
import { action } from "@storybook/addon-actions";
import { boolean, text, select } from "@storybook/addon-knobs";
import { Box, FormControl } from "@material-ui/core";
import { showInfoDialog } from "../../../non-standalone";
import { useDialogContext } from "../../../framework";

export const SelectorSingle = (): React.ReactElement => {
	const [selected, setSelected] = useState<BaseSelectorData | null>(null);
	const [pushDialog] = useDialogContext();
	const variant = select(
		"TextField mode",
		{
			outlined: "outlined",
			standard: "standard",
		},
		"outlined"
	);
	const dialogTitle = text("Dialog title", "Sample title");
	const infoText = text(
		"Info Text",
		"This is a pretty long info text which supports html. It really is.<br> It explains you what to write in here."
	);
	const dialogButtonLabel = text("Dialog button label", "Ok");
	const dialogButtonClick = action("onClose");
	const loadDataAction = action("onLoad");
	const onSelectAction = action("onSelect");
	const onAddNewAction = function (...args: unknown[]) {
		action("onAddNew")(args);
		return null;
	};
	const label = text("Label", "Example selector");
	const enableAddNew = boolean("Enable Add New", false);
	const disableClearable = boolean("Disable clearable?", false);
	const disableSearch = boolean("Disable search?", false);
	const icons = boolean("Enable Icons", false);
	const disabled = boolean("Disable", false);
	const grouped = boolean("Grouped", false);
	const noGroupLabel = grouped ? text("No Group label", "No group") : "";
	const addNewLabel = text("Add new label", "Add");
	const useCustomLoading = boolean("Use custom loading label?", true);
	const loadingLabel = text("Loading Label", "Loading..");
	const useCustomNoOptionsText = boolean("Use custom no data label?", false);
	const noOptionsText = text("No data Label", "No option");
	const placeholderLabel = text("Placeholder Label", "Select..");
	const useCustomOpenText = boolean("Use custom open text label?", false);
	const openText = text("Open Text Label", "Open");
	const useCustomCloseText = boolean("Use custom close text label?", false);
	const closeText = text("Close Text Label", "Close");
	const lru = boolean("Use LRU?", false);

	const loadData = useCallback(
		(query: string): BaseSelectorData[] => {
			loadDataAction(query);
			return colourOptions
				.map((entry) => ({ ...entry, group: entry.type }))
				.filter((option) =>
					option.label.toLowerCase().includes(query.toLowerCase())
				);
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
				<SingleSelect
					label={label}
					variant={variant}
					selected={selected}
					onSelect={onSelect}
					onLoad={loadData}
					onAddNew={enableAddNew ? onAddNewAction : undefined}
					enableIcons={icons}
					disableClearable={disableClearable}
					disableSearch={disableSearch}
					disabled={disabled}
					addNewLabel={addNewLabel}
					loadingText={useCustomLoading ? loadingLabel : undefined}
					noOptionsText={useCustomNoOptionsText ? noOptionsText : undefined}
					openText={useCustomOpenText ? openText : undefined}
					closeText={useCustomCloseText ? closeText : undefined}
					placeholder={placeholderLabel}
					autocompleteId={"single-select"}
					grouped={grouped}
					noGroupLabel={noGroupLabel}
					lru={
						lru
							? ({
									count: 5,
									loadData: (id) =>
										colourOptions.find((opt) => opt.value === id),
									forceQuery: true,
									storageKey: "story-single-select-lru",
							  } as SelectorLruOptions<typeof colourOptions[0]>)
							: undefined
					}
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

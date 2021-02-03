import React, { useState, useCallback } from "react";
import "../../../i18n";
import { BaseSelectorData, MultiSelectorData } from "../../../standalone";
import { action } from "@storybook/addon-actions";
import { boolean, number, text } from "@storybook/addon-knobs";
import { Box } from "@material-ui/core";
import CustomMultiSelectEntry from "../../standalone/Selector/CustomMultiSelectEntry";
import BackendMultiSelect from "../../../backend-components/Selector/MultiSelect";
import TestModelInstance from "../DataGrid/TestModel";

export const SelectorMulti = (): React.ReactElement => {
	const [selected, setSelected] = useState<string[]>([]);
	const onSelectAction = action("onSelect");
	const onAddNewAction = action("onAddNew");
	const enableAddNew = boolean("Enable Add New", false);
	const icons = boolean("Enable Icons", false);
	const disabled = boolean("Disable", false);
	const customSelectedRenderer = boolean(
		"Enable Custom Selected Renderer",
		false
	);
	const searchResultLimit = number("Search result limit", 25);
	const addNewLabel = text("Add new label", "Add");
	const loadingText = text("Loading Text", "Loading..");
	const noOptionsText = text("No data Label", "No option");
	const placeholderLabel = text("Placeholder Label", "Select..");

	const onSelect = useCallback(
		(data: string[]) => {
			onSelectAction(data);
			setSelected(data);
		},
		[onSelectAction, setSelected]
	);

	const modelToSelectorData = useCallback(
		(
			data: Record<keyof typeof TestModelInstance.fields, unknown>
		): MultiSelectorData => ({
			value: data.id as string,
			label: `${data.first_name as string} ${data.last_name as string}`,
			icon: data.avatar ? (
				<img alt={""} src={data.avatar as string} />
			) : undefined,
		}),
		[]
	);

	return (
		<Box m={2}>
			<BackendMultiSelect
				model={TestModelInstance}
				modelToSelectorData={modelToSelectorData}
				searchResultLimit={searchResultLimit}
				selected={selected}
				onSelect={onSelect}
				onAddNew={enableAddNew ? onAddNewAction : undefined}
				enableIcons={icons}
				selectedEntryRenderer={
					customSelectedRenderer ? CustomMultiSelectEntry : undefined
				}
				disabled={disabled}
				addNewLabel={addNewLabel}
				loadingText={loadingText}
				noOptionsText={noOptionsText}
				placeholder={placeholderLabel}
				autocompleteId={"multi-select"}
			/>
		</Box>
	);
};

SelectorMulti.storyName = "Multi";

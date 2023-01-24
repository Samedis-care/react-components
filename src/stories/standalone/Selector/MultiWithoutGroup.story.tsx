import React, { useState, useCallback } from "react";
import "../../../i18n";
import {
	MultiSelectWithoutGroup,
	MultiSelectorData,
	SelectorLruOptions,
	getStringLabel,
} from "../../../standalone/Selector";
import { colourOptions } from "./Data";
import { action } from "@storybook/addon-actions";
import { boolean, number, text } from "@storybook/addon-knobs";
import { useDialogContext } from "../../../framework";
import { showInfoDialog } from "../../../non-standalone";

type MultiWithoutGroupData = typeof colourOptions[number] & MultiSelectorData;

interface MySelectorData extends MultiWithoutGroupData {
	id: string;
}

const enhanceData = (entry: MultiWithoutGroupData): MySelectorData => ({
	...entry,
	onClick: action(`onClick: ${getStringLabel(entry)}`),
	canUnselect: (evtEntry: MultiSelectorData) => {
		action(`canUnselect: ${getStringLabel(evtEntry)}`)(evtEntry);
		return true;
	},
	id: entry.value,
});

const options = colourOptions.map(enhanceData);

export const MultiWithoutGroup = (): React.ReactElement => {
	const [selected, setSelected] = useState<MultiWithoutGroupData[]>([]);
	const [switchValue, setSwitchValue] = useState<boolean>(false);
	const onSelectAction = action("onSelect");

	const title = text("Title", "Multi Without Groups");
	const icons = boolean("Enable Icons", false);
	const disabled = boolean("Disable", false);
	const [pushDialog] = useDialogContext();
	const dialogTitle = text("Dialog title", "Sample title");
	const infoText = text(
		"Info Text",
		"This is a pretty long info text which supports html. It really is.<br> It explains you what to write in here."
	);
	const dialogButtonLabel = text("Dialog button label", "Ok");
	const dialogButtonClick = action("onClose");
	const useCustomLoadingLabel = boolean("Use custom loading label?", true);
	const loadingLabel = text("Loading Label", "Loading..");
	const useCustomNoOptionsText = boolean("Use custom no data label?", false);
	const noOptionsText = text("No data Label", "No option");
	const displaySwitch = boolean("Enable Switch?", true);
	const switchLabel = text("Switch Label", "Bright colours");

	const onSelect = useCallback(
		(data: MultiWithoutGroupData[]) => {
			onSelectAction(data);
			setSelected(data);
		},
		[onSelectAction, setSelected]
	);

	const brightColours = ["ocean", "yellow", "green", "silver"];

	const useLru = boolean("use LRU", false);
	const count = number("Maximum number of LRU-options", 5, {
		range: true,
		min: 1,
		max: 25,
		step: 1,
	});
	const forceQuery = boolean("forceQuery", false);

	const lru: SelectorLruOptions<MultiWithoutGroupData> | undefined = useLru
		? {
				count: count,
				loadData: (
					id: string
				): Promise<MultiWithoutGroupData> | MultiWithoutGroupData => {
					return options.find((entry) => {
						return entry.id === id;
					}) as MultiWithoutGroupData;
				},
				storageKey: "test-storage-key",
				forceQuery: forceQuery,
		  }
		: undefined;

	return (
		<MultiSelectWithoutGroup<MultiWithoutGroupData>
			label={title}
			selected={selected}
			onSelect={onSelect}
			loadDataOptions={(query: string, switchValue: boolean) => {
				action("onLoad")(query, switchValue);
				return options.filter(
					(option) =>
						getStringLabel(option)
							.toLowerCase()
							.includes(query.toLowerCase()) &&
						(switchValue ? brightColours.includes(option.value) : true)
				);
			}}
			autocompleteId={"multi-select-without-group"}
			enableIcons={icons}
			disabled={disabled}
			loadingText={useCustomLoadingLabel ? loadingLabel : undefined}
			noOptionsText={useCustomNoOptionsText ? noOptionsText : undefined}
			displaySwitch={displaySwitch}
			switchLabel={switchLabel}
			switchValue={switchValue}
			setSwitchValue={setSwitchValue}
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
			lru={lru}
		/>
	);
};

MultiWithoutGroup.storyName = "MultiWithoutGroup";

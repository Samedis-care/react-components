import React, { useState } from "react";
import "../../../i18n";
import {
	MultiSelectWithTags,
	MultiSelectorData,
	BaseSelectorData,
} from "../../../standalone/Selector";
import { colourOptions, colourTypeOptions } from "./Data";
import { action } from "@storybook/addon-actions";
import { boolean, text } from "@storybook/addon-knobs";
import { useDialogContext } from "../../../framework";
import { showInfoDialog } from "../../../non-standalone";

type MultiWithTagsData = typeof colourOptions[number] & MultiSelectorData;

const enhanceData = (
	entry: typeof colourOptions[number]
): MultiWithTagsData => ({
	...entry,
	onClick: action("onClick: " + entry.label),
	canUnselect: (evtEntry: MultiSelectorData) => {
		action("canUnselect: " + evtEntry.label)(evtEntry);
		return true;
	},
});

const options = colourOptions.map(enhanceData);

export const SelectorMultiWithTags = (): React.ReactElement => {
	const [selected, setSelected] = useState<MultiWithTagsData[]>([]);
	const title = text("Title", "Multi Selector With Tags");
	const icons = boolean("Enable Icons", false);
	const disable = boolean("Disable", false);
	const loadingLabel = text("Loading Label", "");
	const noDataLabel = text("No data Label", "");
	const displaySwitch = boolean("Enable Switch", false);
	const switchLabel = text("Switch Label Text", "Select from all");
	const searchInputLabel = text("Search Label", "Search");
	const [pushDialog] = useDialogContext();
	const dialogTitle = text("Dialog title", "Sample title");
	const infoText = text(
		"Info Text",
		"This is a pretty long info text which supports html. It really is.<br> It explains you what to write in here."
	);
	const dialogButtonLabel = text("Dialog button label", "Ok");
	const dialogButtonClick = action("onClose");

	return (
		<MultiSelectWithTags<MultiWithTagsData, BaseSelectorData>
			selected={selected}
			onChange={setSelected}
			title={title}
			loadGroupEntries={(group: BaseSelectorData) =>
				options.filter((option) => option.type === group.value)
			}
			loadDataOptions={(query: string) =>
				options.filter((option) =>
					option.label.toLowerCase().includes(query.toLowerCase())
				)
			}
			loadGroupOptions={(query: string) =>
				colourTypeOptions.filter((group) =>
					group.label.toLowerCase().includes(query.toLowerCase())
				)
			}
			autocompleteId={"multi-select-with-tags"}
			displaySwitch={displaySwitch}
			switchLabel={switchLabel}
			enableIcons={icons}
			disabled={disable}
			loadingText={loadingLabel}
			noOptionsText={noDataLabel}
			searchInputLabel={searchInputLabel}
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
	);
};

SelectorMultiWithTags.storyName = "MultiWithTags";

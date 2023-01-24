import React, { useState } from "react";
import "../../../i18n";
import {
	MultiSelectWithTags,
	MultiSelectorData,
	BaseSelectorData,
	getStringLabel,
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
	onClick: action("onClick: " + getStringLabel(entry)),
	canUnselect: (evtEntry: MultiSelectorData) => {
		action("canUnselect: " + getStringLabel(evtEntry))(evtEntry);
		return true;
	},
});

const options = colourOptions.map(enhanceData);

export const SelectorMultiWithTags = (): React.ReactElement => {
	const [selected, setSelected] = useState<MultiWithTagsData[]>([]);
	const title = text("Title", "Select a group");
	const icons = boolean("Enable Icons", false);
	const disable = boolean("Disable", false);
	const useCustomLoading = boolean("Use custom loading label?", true);
	const loadingLabel = text("Loading Label", "Loading..");
	const useCustomNoOptionsText = boolean("Use custom no data label?", false);
	const noOptionsText = text("No data Label", "No option");
	const displaySwitch = boolean("Enable Switch", false);
	const switchLabel = text("Switch Label Text", "Select from all");
	const searchInputLabel = text("Search Label", "or search for a single item");
	const [pushDialog] = useDialogContext();
	const dialogTitle = text("Dialog title", "Sample title");
	const infoText = text(
		"Info Text",
		"This is a pretty long info text which supports html. It really is.<br> It explains you what to write in here."
	);
	const dialogButtonLabel = text("Dialog button label", "Ok");
	const dialogButtonClick = action("onClose");
	const useCustomOpenText = boolean("Use custom open text label?", false);
	const openText = text("Open Text Label", "Open");
	const useCustomCloseText = boolean("Use custom close text label?", false);
	const closeText = text("Close Text Label", "Close");

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
					getStringLabel(option).toLowerCase().includes(query.toLowerCase())
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
			loadingText={useCustomLoading ? loadingLabel : undefined}
			noOptionsText={useCustomNoOptionsText ? noOptionsText : undefined}
			openText={useCustomOpenText ? openText : undefined}
			closeText={useCustomCloseText ? closeText : undefined}
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

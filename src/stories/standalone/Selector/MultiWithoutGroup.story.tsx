import React, { useState } from "react";
import "../../../i18n";
import {
	MultiSelectWithoutGroup,
	MultiSelectorData,
	BaseSelectorData,
} from "../../../standalone/Selector";
import { colourOptions } from "./Data";
import { action } from "@storybook/addon-actions";
import { boolean, text } from "@storybook/addon-knobs";
import { useDialogContext } from "../../../framework";
import { showInfoDialog } from "../../../non-standalone";

type MultiWithoutGroupData = typeof colourOptions[number] & MultiSelectorData;

const enhanceData = (
	entry: typeof colourOptions[number]
): MultiWithoutGroupData => ({
	...entry,
	onClick: action("onClick: " + entry.label),
	canUnselect: (evtEntry: MultiSelectorData) => {
		action("canUnselect: " + evtEntry.label)(evtEntry);
		return true;
	},
});

const options = colourOptions.map(enhanceData);

export const MultiWithoutGroup = (): React.ReactElement => {
	const [selected, setSelected] = useState<MultiWithoutGroupData[]>([]);
	const title = text("Title", "Multi Without Groups");
	const icons = boolean("Enable Icons", false);
	const disable = boolean("Disable", false);
	const [pushDialog] = useDialogContext();
	const dialogTitle = text("Dialog title", "Sample title");
	const infoText = text(
		"Info Text",
		"This is a pretty long info text which supports html. It really is.<br> It explains you what to write in here."
	);
	const dialogButtonLabel = text("Dialog button label", "Ok");
	const dialogButtonClick = action("onClose");

	return (
		<MultiSelectWithoutGroup<MultiWithoutGroupData, BaseSelectorData>
			selected={selected}
			onChange={setSelected}
			searchInputLabel={title}
			loadDataOptions={(query: string) =>
				options.filter((option) =>
					option.label.toLowerCase().includes(query.toLowerCase())
				)
			}
			autocompleteId={"multi-select-without-group"}
			enableIcons={icons}
			disabled={disable}
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

MultiWithoutGroup.storyName = "MultiWithoutGroup";

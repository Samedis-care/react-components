import React, { useState } from "react";
import { boolean, text } from "@storybook/addon-knobs";
import { MultiSelectWithCheckBox } from "../../../standalone/Selector";
import { MultiSelectOption } from "../../../standalone/Selector/TypesMultiSelect";

const values: string[] = ["value1", "value2"];
const options: MultiSelectOption[] = [
	{ label: "Value 1", value: "value1" },
	{ label: "Value 2", value: "value2" },
	{ label: "Value 3", value: "value3" },
];

export const MultiSelectWithCheckBoxStory = (): React.ReactElement => {
	const [selected, setSelected] = useState<string[]>(values);

	const onChange = (event: React.ChangeEvent<{ value: unknown }>) => {
		const values = event.target.value as string[];
		setSelected(values);
	};

	const getSelected = (values: string[]): string => {
		return values
			.map(
				(selected) => options.find((option) => option.value === selected)?.label
			)
			.filter((selected) => selected)
			.join(", ");
	};

	return (
		<MultiSelectWithCheckBox
			values={selected}
			label={text("Label", "Example label")}
			placeholder={text("Placeholder", "Select..")}
			fullWidth={boolean("100% Width", true)}
			options={options}
			onChange={onChange}
			renderValue={(selected) => getSelected(selected as string[])}
		/>
	);
};

MultiSelectWithCheckBoxStory.storyName = "MultiSelectWithCheckBox";

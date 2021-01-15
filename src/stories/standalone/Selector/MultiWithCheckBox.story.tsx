import React, { useState } from "react";
import { boolean } from "@storybook/addon-knobs";
import { MultiSelectWithCheckBox } from "../../../standalone/Selector";
import { MultiSelectOption } from "../../../standalone/Selector/TypesMultiSelect";

const values: string[] = ["value1", "value2"];
const options = [
	{ label: "Value 1", value: "value1" },
	{ label: "Value 2", value: "value2" },
	{ label: "Value 3", value: "value3" },
];

export const MultiSelectWithCheckBoxStory = (): React.ReactElement => {
	const [selected, setSelected] = useState<string[]>(values);

	const onChange = (event: React.ChangeEvent<{ value: unknown }>) => {
		const values = event.target.value as string[];
		if (values?.length > 0) setSelected(values);
		else return;
	};

	const getSelected = (values: string[]) => {
		if (values?.length > 0) {
			const selectedOptions: string[] = [];
			values.forEach((selectedValue: string) => {
				let selectedOption: string | undefined = "";
				selectedOption = options.find(
					(option: MultiSelectOption) => option.value === selectedValue
				)?.label;
				if (selectedOption) selectedOptions.push(selectedOption);
			});
			return selectedOptions.join(",");
		} else return;
	};

	return (
		<MultiSelectWithCheckBox
			values={selected}
			placeholder={"Select.."}
			fullWidth={boolean("100% Width", true)}
			options={options}
			onChange={onChange}
			renderValue={(selected) => getSelected(selected as string[])}
		/>
	);
};

MultiSelectWithCheckBoxStory.storyName = "MultiSelectWithCheckBox";

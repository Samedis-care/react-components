import React, { useState } from "react";
import {
	ScheduleFilterDefinitionSelect,
	ScheduleFilterDefinitionSwitch,
} from "./DayContents";
import { styled } from "@mui/material";
import combineClassNames from "../../../utils/combineClassNames";

const ScheduleFilterRenderer = (
	props: Omit<
		ScheduleFilterRendererSelectProps | ScheduleFilterRendererSwitchProps,
		"value"
	> & { value: string | boolean },
) => {
	const type = props.type;
	if (type === "select")
		return (
			<ScheduleFilterRendererSelect
				{...(props as ScheduleFilterRendererSelectProps)}
			/>
		);
	if (type === "checkbox")
		return (
			<ScheduleFilterRendererSwitch
				{...(props as ScheduleFilterRendererSwitchProps)}
			/>
		);
	throw new Error(`Invalid filter type: ${type as string}`);
};

const StyledSelect = styled("select", {
	name: "CcScheduleFilterRendererSelect",
	slot: "root",
})(({ theme }) => ({
	border: "none",
	backgroundColor: "transparent",
	cursor: "pointer",
	width: "100%",
	"&.Cc-scrollable": {
		color: theme.palette.primary.contrastText,
	},
}));

interface ScheduleFilterRendererSelectProps
	extends Pick<ScheduleFilterDefinitionSelect, "type" | "options"> {
	/**
	 * The name of the filter
	 */
	name: string;
	/**
	 * The current value
	 */
	value: string;
	/**
	 * The change handler
	 */
	onChange: React.ChangeEventHandler<HTMLSelectElement>;
	/**
	 * render inline?
	 */
	inline?: "scrollable" | "weekly";
}

const ScheduleFilterRendererSelect = (
	props: ScheduleFilterRendererSelectProps,
) => {
	return (
		<StyledSelect
			value={props.value}
			name={props.name}
			onChange={props.onChange}
			className={combineClassNames([
				props.inline === "scrollable" && "Cc-scrollable",
			])}
		>
			{Object.entries(props.options).map(([value, label]) => (
				<option value={value} key={value}>
					{label}
				</option>
			))}
		</StyledSelect>
	);
};

interface ScheduleFilterRendererSwitchProps
	extends Pick<ScheduleFilterDefinitionSwitch, "type" | "label"> {
	/**
	 * The name of the filter
	 */
	name: string;
	/**
	 * The current value
	 */
	value: boolean;
	/**
	 * The change handler
	 */
	onChange: React.ChangeEventHandler<HTMLInputElement>;
	/**
	 * render inline?
	 */
	inline?: "scrollable" | "weekly";
}

const ScheduleFilterRendererSwitch = (
	props: ScheduleFilterRendererSwitchProps,
) => {
	const [id] = useState(Math.random().toString().substring(2));

	return (
		<>
			<input
				type={"checkbox"}
				id={id}
				name={props.name}
				checked={props.value}
				onChange={props.onChange}
			/>
			<label htmlFor={id}>{props.label}</label>
		</>
	);
};

export default React.memo(ScheduleFilterRenderer);

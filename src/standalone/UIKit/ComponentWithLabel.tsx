import React from "react";
import {
	FormControlLabel,
	FormControlLabelProps,
	styled,
	Typography,
	TypographyProps,
	useThemeProps,
} from "@mui/material";
import combineClassNames from "../../utils/combineClassNames";

export interface ComponentWithLabelProps
	extends Omit<FormControlLabelProps, "label"> {
	/**
	 * The text of the label
	 */
	labelText: string;
	/**
	 * Label variant
	 */
	labelVariant?: TypographyProps["variant"];
	/**
	 * Label location
	 */
	labelDisplay?: TypographyProps["display"];
	/**
	 * Label alignment
	 */
	labelAlign?: TypographyProps["align"];
	/**
	 * custom class name to apply to root
	 */
	className?: string;
	/**
	 * Custom styles
	 */
	classes?: Partial<Record<ComponentWithLabelClassKey, string>>;
}

const StyledFormControlLabel = styled(FormControlLabel, {
	name: "CcComponentWithLabel",
	slot: "root",
})({});

const Label = styled(Typography, {
	name: "CcComponentWithLabel",
	slot: "label",
})({
	whiteSpace: "pre",
});

export type ComponentWithLabelClassKey = "root" | "label";

const ComponentWithLabel = (
	inProps: ComponentWithLabelProps | FormControlLabelProps,
) => {
	let props = useThemeProps({ props: inProps, name: "CcComponentWithLabel" });

	let label: FormControlLabelProps["label"];

	if ("labelText" in props) {
		let {
			// eslint-disable-next-line prefer-const
			labelText,
			labelVariant,
			labelDisplay,
			labelAlign,
			// eslint-disable-next-line prefer-const
			...propsCopy
		} = props;
		const labelPlacement = props.labelPlacement || "end";
		labelVariant = labelVariant ?? "caption";
		labelDisplay = labelDisplay ?? "block";
		labelAlign =
			labelAlign ??
			({
				start: "right",
				end: "left",
				top: "center",
				bottom: "center",
			}[labelPlacement] as TypographyProps["align"]);
		label = (
			<Label
				variant={labelVariant}
				display={labelDisplay}
				align={labelAlign}
				className={propsCopy.classes?.label}
			>
				{labelText}
			</Label>
		);
		props = { ...propsCopy, label: "" };
	} else {
		label = props.label;
	}
	return (
		<StyledFormControlLabel
			{...props}
			className={combineClassNames([props.className, props.classes?.root])}
			label={label}
		/>
	);
};

export default React.memo(ComponentWithLabel);

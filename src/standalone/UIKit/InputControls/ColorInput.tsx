import React, { useEffect, useState } from "react";
import { TextFieldWithHelp } from "../index";
import { TextFieldWithHelpProps } from "../TextFieldWithHelp";
import { ChromePicker, ColorResult } from "react-color";
import { Popover, PopoverOrigin, TextFieldProps } from "@material-ui/core";

export type ColorInputProps = TextFieldWithHelpProps &
	Omit<TextFieldProps, "onChange" | "value" | "onClick" | "multiline"> & {
		/**
		 * On Change event handler
		 * @param newColor The new color or empty string
		 */
		onChange: (newColor: string) => void;
		/**
		 * The current color
		 */
		value: string;
	};

const anchorOrigin: PopoverOrigin = {
	vertical: "bottom",
	horizontal: "center",
};
const transformOrigin: PopoverOrigin = {
	vertical: "top",
	horizontal: "center",
};

const ColorInput = (props: ColorInputProps) => {
	const { value, onChange } = props;
	const [pickerAnchor, setPickerAnchor] = useState<HTMLElement | null>(null);
	const openColorPicker = (evt: React.MouseEvent<HTMLElement>) => {
		if (props.disabled) return;
		setPickerAnchor(evt.currentTarget);
	};
	const closeColorPicker = () => setPickerAnchor(null);

	// close picker when going read-only
	useEffect(() => {
		if (!props.disabled) return;
		setPickerAnchor(null);
	}, [props.disabled]);

	const handleTextFieldChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
		onChange(evt.target.value);
	};

	const handleColorPickerChange = (color: ColorResult) => {
		onChange(color.hex);
	};

	return (
		<>
			<TextFieldWithHelp
				{...props}
				value={value}
				onChange={handleTextFieldChange}
				onClick={openColorPicker}
				multiline={false}
				/*inputProps={{
					...props.inputProps,
					style: {
						...props.inputProps?.style,
						color: value,
					},
				}}*/
			/>

			<Popover
				open={pickerAnchor != null}
				anchorEl={pickerAnchor}
				anchorOrigin={anchorOrigin}
				transformOrigin={transformOrigin}
				onClose={closeColorPicker}
			>
				<ChromePicker color={value} onChange={handleColorPickerChange} />
			</Popover>
		</>
	);
};

export default React.memo(ColorInput);

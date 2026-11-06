import React, { useEffect, useState } from "react";
import TextFieldWithHelp, {
	TextFieldWithHelpProps,
} from "../TextFieldWithHelp";
import { ChromePicker, ColorResult } from "react-color";
import { Popover, PopoverOrigin, TextFieldProps } from "@mui/material";

export type ColorInputProps = TextFieldWithHelpProps &
	Omit<TextFieldProps, "onChange" | "value" | "onClick" | "multiline"> & {
		/**
		 * On Change event handler
		 * @param newColor The new color or empty string
		 */
		onChange: (newColor: string) => void;
		/**
		 * The current color, as text (e.g. `#336699`). `""` or `null` for none,
		 * which shows an empty field; `undefined` (from untyped data) is treated
		 * like `null`.
		 */
		value: string | null;
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
	const { onChange } = props;
	// null and undefined behave like "": the input stays controlled, and the
	// picker gets a string (react-color throws on null)
	const value = props.value ?? "";
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

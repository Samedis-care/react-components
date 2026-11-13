import React, {
	useCallback,
	useEffect,
	useId,
	useMemo,
	useRef,
	useState,
} from "react";
import TextFieldWithHelp, {
	TextFieldWithHelpProps,
} from "../TextFieldWithHelp";
import { ChromePicker, ColorResult } from "react-color";
import {
	IconButton,
	InputAdornment,
	InputAdornmentProps,
	InputProps,
	Popover,
	PopoverOrigin,
	PopoverProps,
	styled,
	TextFieldProps,
} from "@mui/material";
import { Palette as PaletteIcon } from "@mui/icons-material";
import useCCTranslations from "../../../utils/useCCTranslations";
import accessSlotProps from "../../../utils/internal/accessSlotProps";
import focusRing from "../../../utils/internal/focusRing";

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

// MUI shows keyboard focus on an IconButton only as a faint ripple, which forced colors drop
const OpenPickerButton = styled(IconButton)(({ theme }) => ({
	"&.Mui-focusVisible": focusRing(theme, 0),
}));

const ColorInput = (props: ColorInputProps) => {
	const { onChange } = props;
	const { t } = useCCTranslations();
	// null and undefined behave like "": the input stays controlled, and the
	// picker gets a string (react-color throws on null)
	const value = props.value ?? "";
	const [pickerAnchor, setPickerAnchor] = useState<HTMLElement | null>(null);
	const pickerOpen = pickerAnchor != null;
	const fieldRef = useRef<HTMLDivElement>(null);
	// the field needs an id the picker can refer to: MUI names its label `${id}-label`
	const generatedId = useId();
	const id = props.id ?? generatedId;
	const openerId = useId();
	const pickerId = useId();
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

	// the button's own click: the picker hangs below the field, as on a click into it
	const handleOpenerClick = useCallback((evt: React.MouseEvent) => {
		evt.stopPropagation();
		setPickerAnchor(fieldRef.current);
	}, []);

	const openerLabel = t("standalone.uikit.color-input.open-picker");
	const callerSlotProps = props.slotProps;
	// the opener joins TextFieldWithHelp's end adornment, after the caller's own
	const slotProps = useMemo(
		(): TextFieldProps["slotProps"] => ({
			...callerSlotProps,
			input: (state: unknown) => {
				const own = accessSlotProps(
					state,
					callerSlotProps?.input as
						InputProps | ((state: unknown) => InputProps) | undefined,
				);
				const ownEnd = own?.endAdornment;
				return {
					...own,
					endAdornment: (
						<InputAdornment position={"end"}>
							{React.isValidElement<InputAdornmentProps>(ownEnd)
								? ownEnd.props.children
								: ownEnd}
							<OpenPickerButton
								id={openerId}
								onClick={handleOpenerClick}
								disabled={props.disabled}
								size="small"
								aria-label={openerLabel}
								aria-haspopup="dialog"
								aria-expanded={pickerOpen}
								aria-controls={pickerOpen ? pickerId : undefined}
							>
								<PaletteIcon />
							</OpenPickerButton>
						</InputAdornment>
					),
				};
			},
		}),
		[
			callerSlotProps,
			openerId,
			handleOpenerClick,
			props.disabled,
			openerLabel,
			pickerOpen,
			pickerId,
		],
	);

	// the open picker is a modal dialog named after the field, or after its
	// opener when the field has no label
	const pickerSlotProps = useMemo(
		(): PopoverProps["slotProps"] => ({
			paper: {
				id: pickerId,
				role: "dialog",
				"aria-modal": true,
				"aria-labelledby": props.label ? `${id}-label` : openerId,
			},
		}),
		[pickerId, props.label, id, openerId],
	);

	return (
		<>
			<TextFieldWithHelp
				{...props}
				ref={fieldRef}
				id={id}
				value={value}
				onChange={handleTextFieldChange}
				onClick={openColorPicker}
				multiline={false}
				slotProps={slotProps}
				/*inputProps={{
					...props.inputProps,
					style: {
						...props.inputProps?.style,
						color: value,
					},
				}}*/
			/>

			<Popover
				open={pickerOpen}
				anchorEl={pickerAnchor}
				anchorOrigin={anchorOrigin}
				transformOrigin={transformOrigin}
				onClose={closeColorPicker}
				slotProps={pickerSlotProps}
			>
				<ChromePicker color={value} onChange={handleColorPickerChange} />
			</Popover>
		</>
	);
};

/**
 * A text field for a color, with react-color's `ChromePicker` in a popover
 * below it. The palette button at the end of the field ("Choose color", in
 * the library's language) opens the picker, from the pointer or the keyboard,
 * and so does a click anywhere in the field; neither while `disabled`. The
 * open picker is a modal dialog named after the field's label. Escape or a
 * click outside closes it, and focus returns to where it was.
 */
export default React.memo(ColorInput);

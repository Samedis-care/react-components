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
	popoverClasses,
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
	Omit<
		TextFieldProps,
		"onChange" | "value" | "onClick" | "multiline" | "onBlur"
	> & {
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
		/**
		 * Called once focus leaves the field: from the input or a button of the
		 * field to anything outside the field and its open picker. Moving
		 * between the input and the buttons, and into the open picker and back,
		 * is not leaving, so a color picked in the picker has already been
		 * reported through `onChange` when this is called.
		 *
		 * Receives the blur event of the field's input root
		 * (`.MuiInputBase-root`, the `currentTarget`), which carries `name` as
		 * `data-name`, so Form's `handleBlur` can be passed as it is; `target`
		 * is the element that lost focus, the input or one of the buttons. Read
		 * the color from `value`, not from the event. A blur handler set on the
		 * input root (`slotProps.input.slotProps.root.onBlur`) is kept and still
		 * sees every blur of the root.
		 */
		onBlur?: React.FocusEventHandler<HTMLElement>;
	};

/** What the field's input root takes, `data-name` included */
type InputRootProps = React.HTMLAttributes<HTMLDivElement> & {
	"data-name"?: string;
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

/** What a press focuses; a press on anything else takes focus to the page */
const FOCUSABLE = "input, textarea, select, button, a[href], [tabindex]";

/** On the picker's popover while the keyboard opened it */
const KEYBOARD_OPENED_CLASS = "CcColorInput-keyboardOpened";

// the open picker's paper takes focus, and MUI draws no focus on it: a ring
// when the keyboard opened it, none when a pointer did, so the picker looks the
// same as before after a click
const PickerPopover = styled(Popover)(({ theme }) => ({
	[`&.${KEYBOARD_OPENED_CLASS} .${popoverClasses.paper}:focus`]: {
		outline: `2px solid ${theme.palette.primary.main}`,
		outlineOffset: 2,
	},
}));

const ColorInput = (props: ColorInputProps) => {
	const { onChange, onBlur, ...fieldProps } = props;
	const { t } = useCCTranslations();
	// null and undefined behave like "": the input stays controlled, and the
	// picker gets a string (react-color throws on null)
	const value = props.value ?? "";
	const [pickerAnchor, setPickerAnchor] = useState<HTMLElement | null>(null);
	const pickerOpen = pickerAnchor != null;
	// whether the picker was opened without a pointer, from the keyboard: such
	// a click has no click count (detail), a pointer's always has one
	const [pickerFromKeyboard, setPickerFromKeyboard] = useState(false);
	const fieldRef = useRef<HTMLDivElement>(null);
	const pickerRef = useRef<HTMLDivElement>(null);
	// the field needs an id the picker can refer to: MUI names its label `${id}-label`
	const generatedId = useId();
	const id = props.id ?? generatedId;
	const openerId = useId();
	const pickerId = useId();
	const openColorPicker = (evt: React.MouseEvent<HTMLElement>) => {
		if (props.disabled) return;
		setPickerFromKeyboard(evt.detail === 0);
		setPickerAnchor(evt.currentTarget);
	};
	const closeColorPicker = () => setPickerAnchor(null);

	// A press on a part of the field that takes no focus (the label, the helper
	// text, the space around the input) would take focus out of the field, and
	// report a blur, before its click opens the picker: while focus is in the
	// field, it stays where it is.
	const callerMouseDown = props.onMouseDown;
	const disabled = props.disabled;
	const handleFieldMouseDown = useCallback(
		(evt: React.MouseEvent<HTMLDivElement>) => {
			callerMouseDown?.(evt);
			if (disabled || evt.defaultPrevented) return;
			const field = evt.currentTarget;
			if (!field.contains(field.ownerDocument.activeElement)) return;
			const pressed = evt.target as Element;
			const focusable = pressed.closest(FOCUSABLE);
			if (focusable && field.contains(focusable)) return;
			evt.preventDefault();
		},
		[callerMouseDown, disabled],
	);

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
		setPickerFromKeyboard(evt.detail === 0);
		setPickerAnchor(fieldRef.current);
	}, []);

	const openerLabel = t("standalone.uikit.color-input.open-picker");
	const callerSlotProps = props.slotProps;
	const { name } = props;
	// the opener joins TextFieldWithHelp's end adornment, after the caller's own;
	// onBlur moves from the input to the input root, which holds the buttons too
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
				const ownRoot = own?.slotProps?.root;
				const root: InputRootProps = {
					// names the field in the blur event, for Form's handleBlur
					"data-name": name,
					...ownRoot,
					onBlur: (event: React.FocusEvent<HTMLDivElement>) => {
						ownRoot?.onBlur?.(event);
						if (!onBlur) return;
						// focus that stays in the field, or goes into the open picker
						// (which hands it back to the field when it closes), has not
						// left the field; a closing picker is no longer part of it
						const next = event.relatedTarget;
						if (
							next &&
							(event.currentTarget.contains(next) ||
								(pickerOpen && pickerRef.current?.contains(next)))
						)
							return;
						onBlur(event);
					},
				};
				return {
					...own,
					slotProps: { ...own?.slotProps, root },
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
			name,
			onBlur,
			openerId,
			handleOpenerClick,
			props.disabled,
			openerLabel,
			pickerOpen,
			pickerId,
		],
	);

	// the open picker is a modal dialog named after the field, or after its
	// opener when the field has no label; MUI's focus trap focuses its paper
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
				{...fieldProps}
				ref={fieldRef}
				id={id}
				value={value}
				onChange={handleTextFieldChange}
				onClick={openColorPicker}
				onMouseDown={handleFieldMouseDown}
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

			<PickerPopover
				ref={pickerRef}
				className={pickerFromKeyboard ? KEYBOARD_OPENED_CLASS : undefined}
				open={pickerOpen}
				anchorEl={pickerAnchor}
				anchorOrigin={anchorOrigin}
				transformOrigin={transformOrigin}
				onClose={closeColorPicker}
				slotProps={pickerSlotProps}
			>
				<ChromePicker color={value} onChange={handleColorPickerChange} />
			</PickerPopover>
		</>
	);
};

/**
 * A text field for a color, with react-color's `ChromePicker` in a popover
 * below it. The palette button at the end of the field ("Choose color", in
 * the library's language) opens the picker, from the pointer or the keyboard,
 * and so does a click anywhere in the field; neither while `disabled`. The
 * open picker is a modal dialog named after the field's label. It takes focus,
 * and shows a focus ring when the keyboard opened it. Escape or a
 * click outside closes it, and focus returns to where it was. `onBlur` is
 * called once focus leaves the field, the open picker counting as part of it.
 */
export default React.memo(ColorInput);

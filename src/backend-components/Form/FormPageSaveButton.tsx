import React, { useId, useMemo } from "react";
import { Tooltip } from "@mui/material";
// deep import, not the standalone barrel: this module is reached through the Form barrel
// (see DefaultFormPageButtons)
import ActionButton, {
	ActionButtonProps,
} from "../../standalone/UIKit/ActionButton";
import { useFormContextLite } from "./Form";
import useCCTranslations from "../../utils/useCCTranslations";
import { ModelUnknown } from "../../backend-integration/Model/Model";
import combineClassNames from "../../utils/combineClassNames";

/**
 * Props of FormPageSaveButton: ActionButton's, with an optional label
 */
export interface FormPageSaveButtonProps extends Omit<
	ActionButtonProps,
	"children"
> {
	/**
	 * The label
	 * @default the translated "Save" (common.buttons.save)
	 */
	children?: ActionButtonProps["children"];
	/**
	 * Makes the button unavailable: it is marked `aria-disabled="true"` instead of the
	 * native `disabled`, looks disabled (MUI's `Mui-disabled` class), and neither a click
	 * nor Enter or Space calls `onClick`. It stays in the tab order, so a Save that a save
	 * makes unavailable keeps the keyboard focus.
	 * @default false
	 */
	disabled?: boolean;
}

/**
 * The Save button of a form page's footer, as DefaultFormPage and FlowEngineSaveButton
 * render it: an ActionButton that says why the form is read-only.
 *
 * While the Form is read-only and at least one of its read-only reasons has a text
 * (FormProps.readOnlyReasons, a CRUD's editPermissionHint, "The form is currently being
 * saved" while it saves), those texts, joined with ", ", are the button's accessible
 * description and show in a tooltip while the pointer is on the button. Reasons without a
 * text are left out; with none left, the button has no description and no tooltip.
 *
 * It neither saves nor disables itself: pass `onClick` and `disabled` (DefaultFormPage and
 * FlowEngineSaveButton disable it while the form is not dirty, saves or is read-only). A
 * disabled Save stays focusable (see `disabled`), so keyboard focus stays on it during and
 * after a save, and keyboard users reach the reasons too: the tooltip also shows while the
 * button has keyboard focus. An `aria-describedby` of the caller is kept, before the
 * reasons. Render it inside a Form.
 * @remarks The button sits in a `span` that takes the pointer events a disabled button
 *          does not get (MUI's way to put a tooltip on a disabled button), also while the
 *          form is editable, so the button is not mounted again when the form turns
 *          read-only for a save.
 */
const FormPageSaveButton = (props: FormPageSaveButtonProps) => {
	const { children, disabled, onClick, className, ...buttonProps } = props;
	const { t } = useCCTranslations();
	const { readOnlyReasons } = useFormContextLite<ModelUnknown>();
	const descriptionId = useId();
	const reason = useMemo(
		() =>
			Object.values(readOnlyReasons)
				.filter((text) => !!text)
				.join(", "),
		[readOnlyReasons],
	);
	const describedBy = reason
		? [buttonProps["aria-describedby"], descriptionId].filter(Boolean).join(" ")
		: buttonProps["aria-describedby"];

	return (
		// a title that is no string, with describeChild: MUI puts no aria-label on the span,
		// which as a generic element cannot be named; the button has the reason as its own
		// description, also while the tooltip is closed
		<Tooltip title={reason ? <>{reason}</> : ""} describeChild>
			<span>
				<ActionButton
					{...buttonProps}
					// not the native disabled: a save disables the focused Save, and a natively
					// disabled button drops the focus to the page
					aria-disabled={disabled || undefined}
					className={combineClassNames([className, disabled && "Mui-disabled"])}
					onClick={disabled ? undefined : onClick}
					aria-describedby={describedBy}
				>
					{children ?? t("common.buttons.save")}
				</ActionButton>
				{reason && (
					<span id={descriptionId} hidden>
						{reason}
					</span>
				)}
			</span>
		</Tooltip>
	);
};

export default React.memo(FormPageSaveButton);

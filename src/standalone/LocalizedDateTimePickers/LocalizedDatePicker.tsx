import React, { useCallback } from "react";
import {
	DatePicker,
	DatePickerProps,
	LocalizationProvider,
} from "@mui/x-date-pickers";
import { withMuiWarning } from "../UIKit/MuiWarning";
import useMuiLocaleData from "./useMuiLocaleData";
import usePickerDraft from "./usePickerDraft";
import accessSlotProps from "../../utils/internal/accessSlotProps";

export interface LocalizedDatePickerProps extends Omit<
	DatePickerProps,
	"format"
> {
	/**
	 * Report every keystroke, rather than only dates the user finished entering.
	 * See {@link usePickerDraft}.
	 */
	publishIntermediateValues?: boolean;
}

const LocalizedDatePicker = (props: LocalizedDatePickerProps) => {
	const { publishIntermediateValues, ...otherProps } = props;
	const localeText = useMuiLocaleData();
	const draft = usePickerDraft(
		otherProps.value,
		otherProps.onChange,
		publishIntermediateValues,
	);

	const { settle } = draft;
	const consumerOnOpen = otherProps.onOpen;
	const handleOpen = useCallback(() => {
		// the calendar renders from the value it is given, so a half-typed date
		// would open it on a year nothing is selectable in
		settle();
		consumerOnOpen?.();
	}, [settle, consumerOnOpen]);

	return (
		<LocalizationProvider localeText={localeText}>
			<DatePicker
				format={"L"}
				{...otherProps}
				value={draft.value}
				onChange={draft.onChange}
				onOpen={handleOpen}
				slotProps={{
					...otherProps.slotProps,
					textField: (ownerState) => {
						const orgSlotProps = accessSlotProps(
							ownerState,
							otherProps.slotProps?.textField,
						);
						return {
							...orgSlotProps,
							onBlur: (event: React.FocusEvent<HTMLDivElement>) => {
								draft.settleOnBlur(event);
								orgSlotProps?.onBlur?.(event);
							},
						};
					},
				}}
			/>
		</LocalizationProvider>
	);
};

export default React.memo(withMuiWarning(LocalizedDatePicker));

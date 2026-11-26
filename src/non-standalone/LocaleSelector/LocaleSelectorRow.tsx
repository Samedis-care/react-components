import React, { Suspense } from "react";
import type { RowComponentProps } from "react-window";
import Loader from "../../standalone/Loader";
import LocaleSelectorEntry from "./LocaleSelectorEntry";
import type { LocaleSelectorEntryData } from "./LocaleSelectorDialogContent";

/**
 * What the locale list passes to each of its rows (react-window's `rowProps`)
 */
export interface LocaleSelectorRowData {
	/**
	 * The rows the search leaves, in list order
	 */
	entries: LocaleSelectorEntryData[];
	/**
	 * The current UI language without region, e.g. `"de"`
	 */
	currentLanguage: string;
	/**
	 * Called with the row's locale (`"<lang>-<COUNTRY>"`) when a row is activated
	 */
	handleSwitch: (locale: string) => void;
	/**
	 * Whether the rows are disabled: a picked language loads
	 */
	disabled: boolean;
	/**
	 * The locale of the row activated last, or `null`: while the rows are
	 * disabled, it keeps keyboard focus and its tab stop
	 */
	activated: string | null;
	/**
	 * The locale of the list's active row, its one tab stop, or `null` while the
	 * list shows no rows
	 */
	activeKey: string | null;
}

/**
 * One row of the locale list, react-window's `rowComponent`. It is defined once
 * for the module and gets everything through `rowProps`: react-window keeps its
 * rows by the component's identity, so a component created during render would
 * replace every row with a new node, and focus with it, each time it changes.
 * react-window memoizes it itself (shallowly, by its props).
 *
 * The row's element only places the row; the option inside it (the entry's
 * button) carries the row's role, position and number of rows, so that the
 * listbox owns its options directly.
 */
const LocaleSelectorRow = (props: RowComponentProps<LocaleSelectorRowData>) => {
	const {
		index,
		style,
		ariaAttributes,
		entries,
		currentLanguage,
		handleSwitch,
		disabled,
		activated,
		activeKey,
	} = props;
	const locale = entries[index];

	return (
		<div style={style}>
			<Suspense fallback={<Loader />}>
				<LocaleSelectorEntry
					locale={locale}
					currentLanguage={currentLanguage}
					handleSwitch={handleSwitch}
					disabled={disabled}
					focusableWhenDisabled={locale.locale === activated}
					active={locale.locale === activeKey}
					position={ariaAttributes["aria-posinset"]}
					count={ariaAttributes["aria-setsize"]}
					key={locale.locale}
				/>
			</Suspense>
		</div>
	);
};

export default LocaleSelectorRow;

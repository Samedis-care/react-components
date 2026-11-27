import { jsx as _jsx } from "react/jsx-runtime";
import { Suspense } from "react";
import Loader from "../../standalone/Loader";
import LocaleSelectorEntry from "./LocaleSelectorEntry";
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
const LocaleSelectorRow = (props) => {
    const { index, style, ariaAttributes, entries, currentLanguage, handleSwitch, disabled, activated, activeKey, } = props;
    const locale = entries[index];
    return (_jsx("div", { style: style, children: _jsx(Suspense, { fallback: _jsx(Loader, {}), children: _jsx(LocaleSelectorEntry, { locale: locale, currentLanguage: currentLanguage, handleSwitch: handleSwitch, disabled: disabled, focusableWhenDisabled: locale.locale === activated, active: locale.locale === activeKey, position: ariaAttributes["aria-posinset"], count: ariaAttributes["aria-setsize"] }, locale.locale) }) }));
};
export default LocaleSelectorRow;

import { jsx as _jsx } from "react/jsx-runtime";
import React, { useCallback, useEffect, useMemo, useRef, useState, } from "react";
import { styled, useThemeProps } from "@mui/material";
import { useFormContext } from "./Form";
import debounce from "../../utils/debounce";
import toComparisonJson from "../../utils/toComparisonJson";
import useCCTranslations from "../../utils/useCCTranslations";
import combineClassNames from "../../utils/combineClassNames";
import visuallyHidden from "../../utils/internal/visuallyHidden";
/**
 * State class of the root with showStatus
 */
const VISIBLE_CLASS = "CcFormAutoSave-visible";
/**
 * State class of the root while it says "Could not save"
 */
const FAILED_CLASS = "CcFormAutoSave-failed";
/**
 * Helper to implement auto save in forms
 * @param debounceTime The debounce time (time between changes for save to trigger)
 * @returns The status to show: the outcome of the last save started here while it holds
 */
const useFormAutoSave = (debounceTime = 5000) => {
    const { safeSubmit, submitting, dirty, values } = useFormContext();
    const dataStr = toComparisonJson(values);
    // the values of the last save started here, kept until the form is clean and idle again:
    // a save that failed is not started again for the same values (looking again on idle
    // would repeat it in a loop), the next change is saved
    const triedRef = useRef(null);
    // a save that comes due while the form is busy waits: the effect below starts it again
    // once the form is idle
    const submittingRef = useRef(submitting);
    submittingRef.current = submitting;
    // the outcome of the last save started here
    const [outcome, setOutcome] = useState();
    // the outcome of a save that ends after the form has unmounted is dropped
    const mountedRef = useRef(false);
    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        };
    }, []);
    // counts the saves started here: only the last one's outcome is shown
    const saveCountRef = useRef(0);
    const save = useCallback((data) => {
        if (submittingRef.current)
            return;
        triedRef.current = data;
        const saveNumber = ++saveCountRef.current;
        setOutcome("saving");
        void safeSubmit().then((succeeded) => {
            if (!mountedRef.current || saveNumber !== saveCountRef.current)
                return;
            setOutcome(succeeded ? "saved" : "failed");
        });
    }, [safeSubmit]);
    const debouncedSave = useMemo(() => (debounceTime == 0 ? null : debounce(save, debounceTime)), [save, debounceTime]);
    // a save still waiting for the pause belongs to this mount and this debounceTime: it is
    // dropped when the form unmounts (the user may have left and discarded the change), and
    // when debounceTime changes, where the effect below waits for the new time instead
    useEffect(() => () => debouncedSave?.cancel(), [debouncedSave]);
    // looks again whenever the values change, and when the form turns dirty (a custom field,
    // whose values are not the form's) or idle (a change made while it was busy)
    useEffect(() => {
        if (!dirty && !submitting)
            triedRef.current = null;
        if (!dirty || submitting || dataStr === triedRef.current) {
            debouncedSave?.cancel();
            return;
        }
        if (debouncedSave)
            debouncedSave(dataStr);
        else
            save(dataStr);
    }, [dataStr, dirty, submitting, debouncedSave, save]);
    // an outcome is told while it holds: "Saved" while the form has no changes, and "Could
    // not save" while it has (those it failed on or later ones). A submit that succeeds
    // without saving, as one the form's preSubmit cancels, leaves the form dirty: it tells
    // nothing
    if (!outcome)
        return "idle";
    if (outcome === "saved" && dirty)
        return "idle";
    if (outcome === "failed" && !dirty)
        return "idle";
    return outcome;
};
const FormAutoSaveRoot = styled("span", {
    name: "CcFormAutoSave",
    slot: "root",
})(({ theme }) => ({
    ...theme.typography.caption,
    color: theme.palette.text.secondary,
    [`&.${FAILED_CLASS}`]: {
        color: theme.palette.error.main,
    },
    // shown: a line of its own, one line high also while it is empty, so that the layout
    // does not move when its text comes and goes
    [`&.${VISIBLE_CLASS}`]: {
        display: "block",
        minHeight: "1lh",
    },
    // hidden from sight, kept for screen readers: a 1px box in the top left corner of the
    // nearest positioned ancestor, out of the layout's flow
    [`&:not(.${VISIBLE_CLASS})`]: visuallyHidden,
}));
/**
 * Saves the form (safeSubmit) once it is dirty and idle and its values have not changed for
 * debounceTime milliseconds. Put it anywhere in the form's page where a `span` can go (not
 * directly in a table, a table row or a list).
 *
 * It renders a polite status region (`role="status"`, slot `root`) that tells the outcome
 * of its saves: "Saving…" while one runs, "Saved" once it went through, "Could not save"
 * when it failed, in the library's current language. "Saved" is emptied when the form has
 * changes again, "Could not save" once the form has none (saved or reset by other means).
 * The region is mounted once and only its text changes, so screen readers announce each
 * outcome; an emptied text is not announced. It is not busy itself (`aria-busy="false"`):
 * the form around it is while it saves, and a screen reader holds back the messages of a
 * busy area. A save that the form's `preSubmit` cancels tells nothing.
 *
 * The region is visually hidden, and takes no room in the layout (a 1px box in the top left
 * corner of the nearest positioned ancestor), unless `showStatus` is set: then it is a
 * caption line where FormAutoSave is placed (see {@link FormAutoSaveClassKey}).
 *
 * Theme: `components.CcFormAutoSave` takes `defaultProps` (such as `showStatus` for every
 * form) and `styleOverrides` of the `root` slot.
 * @remarks A change made while the form is busy (a busy reason, or a save in progress) is
 *          saved once the form is idle again. A form that turns dirty without a change of
 *          its values (setCustomFieldDirty, e.g. a nested form or a queued upload) is saved
 *          too.
 * @remarks A save that failed is not started again for the same values: the next change is
 *          saved.
 * @remarks A save still waiting for the pause does not run once the form has unmounted.
 *          When debounceTime changes, it waits for the new time.
 * @remarks Only the saves FormAutoSave starts itself are told, not those of a save button.
 */
const FormAutoSave = (inProps) => {
    const props = useThemeProps({ props: inProps, name: "CcFormAutoSave" });
    const { debounceTime, showStatus, className, classes } = props;
    const status = useFormAutoSave(debounceTime);
    const { t } = useCCTranslations();
    return (_jsx(FormAutoSaveRoot, { role: "status", "aria-busy": false, className: combineClassNames([
            className,
            classes?.root,
            showStatus && VISIBLE_CLASS,
            status !== "idle" && `CcFormAutoSave-${status}`,
        ]), children: status === "idle"
            ? ""
            : t(`backend-components.form.auto-save.${status}`) }));
};
export default React.memo(FormAutoSave);

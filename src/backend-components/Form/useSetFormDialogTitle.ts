import React, { useContext, useEffect } from "react";
import { FormDialogDispatchContext } from "./FormDialog";

/**
 * Shows a title in the title bar of the enclosing `FullFormDialog` while the
 * calling component is mounted, e.g. the heading of a page that can open as a
 * page or in a dialog. `PageTitle` does this with its text; use the hook for
 * a page without a `PageTitle`, or for a title that is more than text (a row
 * with buttons).
 * When the title is set again, the new one replaces it; when the caller
 * unmounts, the dialog shows its `dialogTitle` prop again.
 * @param enabled Whether to set the title; false sets nothing
 * @param title The title, any content. Every new value is set again, so keep
 * an element stable (useMemo).
 * @param priority Whether the title wins over the dialog's `dialogTitle` prop.
 * Default false: the prop wins, and this title shows only when the dialog has
 * none.
 * @returns Whether the title went to a dialog (enabled and inside a
 * FullFormDialog). Render the heading yourself only when it is false.
 */
const useSetFormDialogTitle = (
	enabled: boolean,
	title: React.ReactNode,
	priority = false,
): boolean => {
	const formDialogDispatch = useContext(FormDialogDispatchContext);

	useEffect(() => {
		if (!enabled) return;
		if (!formDialogDispatch) return;
		formDialogDispatch.setTitle(title);
		if (priority) formDialogDispatch.setTitlePriorityMode("dispatch");
		return () => {
			formDialogDispatch.setTitle(null);
			formDialogDispatch.setTitlePriorityMode("prop");
		};
	}, [formDialogDispatch, enabled, title, priority]);

	return enabled && !!formDialogDispatch;
};

export default useSetFormDialogTitle;

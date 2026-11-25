import React from "react";
/**
 * Props of DialogTitle; theme defaults come from
 * `theme.components.CcDialogTitle.defaultProps`
 */
export interface DialogTitleProps {
    /**
     * Element id of the heading. It replaces the id that MUI's `Dialog` points
     * `aria-labelledby` at, so give the `Dialog` the same value as
     * `aria-labelledby`.
     */
    id?: string;
    /**
     * The title. It is the content of the heading (an `h2`) that names the
     * dialog. A title too long for one line wraps onto more lines, like MUI's
     * `DialogTitle`, and a word too long for a line breaks where it has to.
     * With `noTitle` it is rendered next to the close button, not as a heading.
     */
    children: React.ReactNode;
    /**
     * When set, a close (X) button is shown next to the heading, named by
     * `non-standalone.dialog.dialog-title.close`, and this is called when it is
     * clicked. DialogTitle closes nothing itself: pass e.g. the function
     * `useCloseThisDialog` returns.
     */
    onClose?: () => void;
    /**
     * Controls for the dialog as a whole, e.g. an `IconButton` with an
     * `aria-label`, like the `action` of MUI's `CardHeader`. They are shown in
     * the title row after the title and before the close button, outside the
     * heading: they are not part of the dialog's name, and a long title does not
     * push them out of the dialog. When they don't fit beside the title (several
     * controls on a phone), they move below it, with the close button, at the
     * end of the row; direct children that don't fit on one line wrap. Default
     * none.
     */
    action?: React.ReactNode;
    /**
     * For a dialog without a visible title: no heading is rendered, so
     * DialogTitle does not name the dialog. Name it another way, as an MUI
     * `Dialog` without `DialogTitle`: `aria-labelledby` on the `Dialog`
     * pointing at a heading in its content, or an `aria-label` on its paper
     * (`slotProps.paper`). The title row is positioned absolutely at the top
     * right (padding `theme.spacing(1)`), so only the close button shows, over
     * the dialog content. Children are still rendered there, not as a heading
     * (pass none, or an icon). Default false.
     */
    noTitle?: boolean;
    /**
     * CSS class added to the root, the title row that holds the heading and the
     * close button
     */
    className?: string;
    /**
     * CSS classes per slot: `root` (the title row), `textWrapper` (the box
     * around the heading), `text` (the heading, not rendered with `noTitle`),
     * `controls` (the box around `action` and the close button, rendered only
     * with one of them), `action` (the box around `action`, rendered only with
     * it), `closeButton`
     */
    classes?: Partial<Record<DialogTitleClassKey, string>>;
}
/**
 * Slot names of `CcDialogTitle`, for `classes` and theme `styleOverrides`
 */
export type DialogTitleClassKey = "root" | "textWrapper" | "text" | "controls" | "action" | "closeButton";
/**
 * Title row for an MUI `Dialog`: a heading with the title, optional controls
 * (`action`) and an optional close (X) button next to it. Place it inside the
 * `Dialog`: the heading is MUI's `DialogTitle`, so it names the dialog, and
 * the controls and the close button are not part of that name. With `noTitle`
 * there is no heading, only the controls and the close button, and the dialog
 * needs a name from elsewhere.
 * Theme: `CcDialogTitle` (slots `root`, `textWrapper`, `text`, `controls`,
 * `action`, `closeButton`).
 */
export declare const DialogTitle: React.MemoExoticComponent<(inProps: DialogTitleProps) => React.JSX.Element>;

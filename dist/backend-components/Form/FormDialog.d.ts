import React, { Dispatch, SetStateAction } from "react";
export type FormDialogRendererProps = Omit<FormDialogProps, "renderer">;
export interface FormDialogProps {
    /**
     * Dialog tille
     */
    dialogTitle?: React.ReactNode;
    /**
     * Accessible name of the dialog while it shows no title (no `dialogTitle` and none set
     * through `FormDialogDispatch.setTitle`), e.g. the translated purpose of a picker. A shown
     * title names the dialog instead. Without either the dialog has no name, like an MUI `Dialog`
     * without `DialogTitle`: screen readers announce only "dialog". Content that sets its title
     * only once it has loaded needs none: the title takes the focus when it shows, so screen
     * readers read it (see `FullFormDialog`).
     */
    "aria-label"?: string;
    /**
     * Dialog width optional parameter
     * @default "lg"
     */
    maxWidth?: false | "lg" | "xs" | "sm" | "md" | "xl" | undefined;
    /**
     * Dialog fullWidth param
     * @default true
     */
    fullWidth?: boolean;
    /**
     * Boolean flag to use custom classes
     */
    useCustomClasses?: boolean;
    /**
     * Shows an "Open in new tab" button (the open-in-new icon, named by
     * `backend-components.form.form-dialog.open-in-new-tab`) in the title row,
     * before the close button, and calls this, without arguments, when it is
     * activated. Open the dialog's content in a new tab there, e.g. with
     * `window.open(url, "_blank")`. A link set through
     * `FormDialogDispatch.setOpenInNewLink` wins over this prop. Default none: no
     * button.
     */
    openInNewLink?: () => void;
    /**
     * Controls for the dialog's content in the title row, e.g. `IconButton`s with an
     * `aria-label`: shown after the title and before the "Open in new tab" and close buttons,
     * outside the heading, so they are not part of the dialog's name (the `action` of
     * `DialogTitle`). They are rendered in the title row, outside `children`: wrap them in the
     * context providers they need. Controls set through `FormDialogDispatch.setTitleAction`
     * (`useSetFormDialogTitleAction`) win over this prop. Default none.
     */
    titleAction?: React.ReactNode;
    /**
     * Dialog contents
     */
    children?: React.ReactNode;
    /**
     * Called when the X, Escape or a backdrop click closes the dialog, after "Leave form
     * page?" when a form page inside is dirty. A dialog shown with pushDialog then closes
     * itself, unless onClose closed it already, so `onClose={popDialog}` closes only this
     * dialog. A dialog rendered without pushDialog closes only through onClose, which has to
     * stop rendering it. Not called when the content closes the dialog (useCloseThisDialog,
     * popDialog, a goBack).
     */
    onClose?: () => void;
    /**
     * Disable automatic special handling of form dialog. Use if form dialog is only used as layout/design component
     */
    disableFormDialogContext?: boolean;
    /**
     * CSS class name
     */
    className?: string;
    /**
     * Custom renderer, does not need to provide IsInFormDialogContext, FormDialogDispatchContext or handle their logic
     */
    renderer?: React.ComponentType<FormDialogRendererProps>;
}
/**
 * Slot names of `CcFormDialog`, for theme `styleOverrides`: `content` (the
 * content area with useCustomClasses), `openInNewButton` (the "Open in new tab"
 * button) and `openInNewIcon` (its icon)
 */
export type FormDialogClassKey = "content" | "openInNewButton" | "openInNewIcon";
export type FormDialogTitlePriorityMode = "prop" | "dispatch";
export interface FormDialogDispatch {
    /**
     * Shows this title in the dialog's title bar (see `useSetFormDialogTitle`), null for none.
     * A title that shows only after the dialog opened takes the keyboard focus if it is still on
     * the dialog itself (see `FullFormDialog`).
     */
    setTitle: (title: React.ReactNode) => void;
    /**
     * Shows these controls in the dialog's title row, after the title and outside the heading
     * (see `useSetFormDialogTitleAction`), null for none. They win over the dialog's
     * `titleAction` prop.
     */
    setTitleAction: (action: React.ReactNode) => void;
    setOpenInNewLink: Dispatch<SetStateAction<null | (() => void)>>;
    blockClosing: () => void;
    unblockClosing: () => void;
    /**
     * Set the priority mode for the dialog title.
     * - "prop" (default): dialogTitle prop takes priority over title set via setTitle
     * - "dispatch": title set via setTitle takes priority over dialogTitle prop
     */
    setTitlePriorityMode: Dispatch<SetStateAction<FormDialogTitlePriorityMode>>;
}
export declare const IsInFormDialogContext: React.Context<boolean>;
export declare const FormDialogDispatchContext: React.Context<FormDialogDispatch | undefined>;
/**
 * The dialog FullFormDialog renders by default (its `renderer`): an MUI `Dialog` with a
 * `DialogTitle` (the title, then in its `action` the content's controls (`titleAction`) and the
 * open-in-new button, and the close button) and the content. The title names the dialog, else
 * `aria-label` does. A title that shows only after the dialog opened takes the keyboard focus if
 * it is still on the dialog itself, so screen readers read it (see `FullFormDialog`). When a
 * control of the title row goes away while it holds the focus, the dialog gets the focus. A
 * custom renderer can render it with changed props.
 * @param props The props of FullFormDialog, with the title to show as `dialogTitle`
 */
export declare const FormDialogDefaultRenderer: (props: FormDialogRendererProps) => React.JSX.Element;
declare const _default: React.MemoExoticComponent<(inProps: FormDialogProps) => React.JSX.Element>;
export default _default;

import React from "react";
import { TextFieldProps } from "@mui/material";
export declare const useMuiWarningStyles: (props?: any) => import("@mui/styles").ClassNameMap<"warning">;
export interface MuiWarningSourceProps {
    className?: string;
}
export interface MuiWarningResultProps {
    warning?: boolean;
}
export declare const withMuiWarning: <T extends MuiWarningSourceProps>(Component: React.ComponentType<T>) => React.ComponentType<T & MuiWarningResultProps>;
export declare const FormControlCC: React.ComponentType<{
    children?: React.ReactNode;
    classes?: Partial<import("@mui/material").FormControlClasses> | undefined;
    color?: "primary" | "secondary" | "error" | "info" | "success" | "warning" | undefined;
    disabled?: boolean | undefined;
    error?: boolean | undefined;
    fullWidth?: boolean | undefined;
    focused?: boolean | undefined;
    hiddenLabel?: boolean | undefined;
    margin?: "none" | "normal" | "dense" | undefined;
    required?: boolean | undefined;
    size?: "small" | "medium" | undefined;
    sx?: import("@mui/material").SxProps<import("@mui/material").Theme> | undefined;
    variant?: "filled" | "standard" | "outlined" | undefined;
} & import("@mui/material/OverridableComponent").CommonProps & Omit<Pick<React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>, "key" | keyof React.HTMLAttributes<HTMLDivElement>> & {
    ref?: ((instance: HTMLDivElement | null) => void) | React.RefObject<HTMLDivElement> | null | undefined;
}, keyof import("@mui/material/OverridableComponent").CommonProps | "children" | "color" | "sx" | "disabled" | "required" | "size" | "error" | "margin" | "variant" | "focused" | "fullWidth" | "hiddenLabel"> & MuiWarningResultProps>;
export declare const FormControlFieldsetCC: React.ComponentType<{
    component: "fieldset";
} & {
    children?: React.ReactNode;
    classes?: Partial<import("@mui/material").FormControlClasses> | undefined;
    color?: "primary" | "secondary" | "error" | "info" | "success" | "warning" | undefined;
    disabled?: boolean | undefined;
    error?: boolean | undefined;
    fullWidth?: boolean | undefined;
    focused?: boolean | undefined;
    hiddenLabel?: boolean | undefined;
    margin?: "none" | "normal" | "dense" | undefined;
    required?: boolean | undefined;
    size?: "small" | "medium" | undefined;
    sx?: import("@mui/material").SxProps<import("@mui/material").Theme> | undefined;
    variant?: "filled" | "standard" | "outlined" | undefined;
} & import("@mui/material/OverridableComponent").CommonProps & Omit<Pick<React.DetailedHTMLProps<React.FieldsetHTMLAttributes<HTMLFieldSetElement>, HTMLFieldSetElement>, "key" | keyof React.FieldsetHTMLAttributes<HTMLFieldSetElement>> & {
    ref?: ((instance: HTMLFieldSetElement | null) => void) | React.RefObject<HTMLFieldSetElement> | null | undefined;
}, keyof import("@mui/material/OverridableComponent").CommonProps | "children" | "color" | "sx" | "disabled" | "required" | "size" | "error" | "margin" | "variant" | "component" | "focused" | "fullWidth" | "hiddenLabel"> & MuiWarningResultProps>;
export declare const FormLabelCC: React.ComponentType<import("@mui/material").FormLabelBaseProps & import("@mui/material").FormLabelOwnProps & import("@mui/material/OverridableComponent").CommonProps & Omit<Pick<React.DetailedHTMLProps<React.LabelHTMLAttributes<HTMLLabelElement>, HTMLLabelElement>, "key" | keyof React.LabelHTMLAttributes<HTMLLabelElement>> & {
    ref?: ((instance: HTMLLabelElement | null) => void) | React.RefObject<HTMLLabelElement> | null | undefined;
}, keyof import("@mui/material/OverridableComponent").CommonProps | "children" | "color" | "sx" | "form" | "slot" | "title" | "id" | "lang" | "role" | "tabIndex" | "aria-activedescendant" | "aria-atomic" | "aria-autocomplete" | "aria-busy" | "aria-checked" | "aria-colcount" | "aria-colindex" | "aria-colspan" | "aria-controls" | "aria-current" | "aria-describedby" | "aria-details" | "aria-disabled" | "aria-dropeffect" | "aria-errormessage" | "aria-expanded" | "aria-flowto" | "aria-grabbed" | "aria-haspopup" | "aria-hidden" | "aria-invalid" | "aria-keyshortcuts" | "aria-label" | "aria-labelledby" | "aria-level" | "aria-live" | "aria-modal" | "aria-multiline" | "aria-multiselectable" | "aria-orientation" | "aria-owns" | "aria-placeholder" | "aria-posinset" | "aria-pressed" | "aria-readonly" | "aria-relevant" | "aria-required" | "aria-roledescription" | "aria-rowcount" | "aria-rowindex" | "aria-rowspan" | "aria-selected" | "aria-setsize" | "aria-sort" | "aria-valuemax" | "aria-valuemin" | "aria-valuenow" | "aria-valuetext" | "dangerouslySetInnerHTML" | "onCopy" | "onCopyCapture" | "onCut" | "onCutCapture" | "onPaste" | "onPasteCapture" | "onCompositionEnd" | "onCompositionEndCapture" | "onCompositionStart" | "onCompositionStartCapture" | "onCompositionUpdate" | "onCompositionUpdateCapture" | "onFocus" | "onFocusCapture" | "onBlur" | "onBlurCapture" | "onChange" | "onChangeCapture" | "onBeforeInput" | "onBeforeInputCapture" | "onInput" | "onInputCapture" | "onReset" | "onResetCapture" | "onSubmit" | "onSubmitCapture" | "onInvalid" | "onInvalidCapture" | "onLoad" | "onLoadCapture" | "onError" | "onErrorCapture" | "onKeyDown" | "onKeyDownCapture" | "onKeyPress" | "onKeyPressCapture" | "onKeyUp" | "onKeyUpCapture" | "onAbort" | "onAbortCapture" | "onCanPlay" | "onCanPlayCapture" | "onCanPlayThrough" | "onCanPlayThroughCapture" | "onDurationChange" | "onDurationChangeCapture" | "onEmptied" | "onEmptiedCapture" | "onEncrypted" | "onEncryptedCapture" | "onEnded" | "onEndedCapture" | "onLoadedData" | "onLoadedDataCapture" | "onLoadedMetadata" | "onLoadedMetadataCapture" | "onLoadStart" | "onLoadStartCapture" | "onPause" | "onPauseCapture" | "onPlay" | "onPlayCapture" | "onPlaying" | "onPlayingCapture" | "onProgress" | "onProgressCapture" | "onRateChange" | "onRateChangeCapture" | "onSeeked" | "onSeekedCapture" | "onSeeking" | "onSeekingCapture" | "onStalled" | "onStalledCapture" | "onSuspend" | "onSuspendCapture" | "onTimeUpdate" | "onTimeUpdateCapture" | "onVolumeChange" | "onVolumeChangeCapture" | "onWaiting" | "onWaitingCapture" | "onAuxClick" | "onAuxClickCapture" | "onClick" | "onClickCapture" | "onContextMenu" | "onContextMenuCapture" | "onDoubleClick" | "onDoubleClickCapture" | "onDrag" | "onDragCapture" | "onDragEnd" | "onDragEndCapture" | "onDragEnter" | "onDragEnterCapture" | "onDragExit" | "onDragExitCapture" | "onDragLeave" | "onDragLeaveCapture" | "onDragOver" | "onDragOverCapture" | "onDragStart" | "onDragStartCapture" | "onDrop" | "onDropCapture" | "onMouseDown" | "onMouseDownCapture" | "onMouseEnter" | "onMouseLeave" | "onMouseMove" | "onMouseMoveCapture" | "onMouseOut" | "onMouseOutCapture" | "onMouseOver" | "onMouseOverCapture" | "onMouseUp" | "onMouseUpCapture" | "onSelect" | "onSelectCapture" | "onTouchCancel" | "onTouchCancelCapture" | "onTouchEnd" | "onTouchEndCapture" | "onTouchMove" | "onTouchMoveCapture" | "onTouchStart" | "onTouchStartCapture" | "onPointerDown" | "onPointerDownCapture" | "onPointerMove" | "onPointerMoveCapture" | "onPointerUp" | "onPointerUpCapture" | "onPointerCancel" | "onPointerCancelCapture" | "onPointerEnter" | "onPointerEnterCapture" | "onPointerLeave" | "onPointerLeaveCapture" | "onPointerOver" | "onPointerOverCapture" | "onPointerOut" | "onPointerOutCapture" | "onGotPointerCapture" | "onGotPointerCaptureCapture" | "onLostPointerCapture" | "onLostPointerCaptureCapture" | "onScroll" | "onScrollCapture" | "onWheel" | "onWheelCapture" | "onAnimationStart" | "onAnimationStartCapture" | "onAnimationEnd" | "onAnimationEndCapture" | "onAnimationIteration" | "onAnimationIterationCapture" | "onTransitionEnd" | "onTransitionEndCapture" | "defaultChecked" | "defaultValue" | "suppressContentEditableWarning" | "suppressHydrationWarning" | "accessKey" | "contentEditable" | "contextMenu" | "dir" | "draggable" | "hidden" | "placeholder" | "spellCheck" | "translate" | "radioGroup" | "about" | "datatype" | "inlist" | "prefix" | "property" | "resource" | "typeof" | "vocab" | "autoCapitalize" | "autoCorrect" | "autoSave" | "itemProp" | "itemScope" | "itemType" | "itemID" | "itemRef" | "results" | "security" | "unselectable" | "inputMode" | "is" | "disabled" | "required" | "htmlFor" | "error" | "filled" | "focused"> & MuiWarningResultProps>;
export declare const FormHelperTextCC: React.ComponentType<{
    children?: React.ReactNode;
    classes?: Partial<import("@mui/material").FormHelperTextClasses> | undefined;
    disabled?: boolean | undefined;
    error?: boolean | undefined;
    filled?: boolean | undefined;
    focused?: boolean | undefined;
    margin?: "dense" | undefined;
    required?: boolean | undefined;
    sx?: import("@mui/material").SxProps<import("@mui/material").Theme> | undefined;
    variant?: "filled" | "standard" | "outlined" | undefined;
} & import("@mui/material/OverridableComponent").CommonProps & Omit<Pick<React.DetailedHTMLProps<React.HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement>, "key" | keyof React.HTMLAttributes<HTMLParagraphElement>> & {
    ref?: ((instance: HTMLParagraphElement | null) => void) | React.RefObject<HTMLParagraphElement> | null | undefined;
}, keyof import("@mui/material/OverridableComponent").CommonProps | "children" | "sx" | "disabled" | "required" | "error" | "margin" | "filled" | "variant" | "focused"> & MuiWarningResultProps>;
export declare const TextFieldCC: React.ComponentType<TextFieldProps & MuiWarningResultProps>;

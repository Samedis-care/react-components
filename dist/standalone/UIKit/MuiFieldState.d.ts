import React from "react";
import { CSSObject, TextFieldProps, Theme } from "@mui/material";
/**
 * What a component must accept to be wrapped by {@link withMuiFieldState}
 */
export interface MuiFieldStateSourceProps {
    className?: string;
}
/**
 * The field states this library adds on top of MUI's own error/required/disabled
 */
export interface MuiFieldStateProps {
    /**
     * Is there a warning on the field?
     * @remarks A step below error: colours the label, underline and outline in
     *          `palette.warning.main`, and yields to `error` where both are set.
     */
    warning?: boolean;
    /**
     * Does the value differ from the server-side value?
     * @remarks Draws {@link dirtyMarkerStyles} after the control's label, and exposes a
     *          `data-cc-dirty` attribute for anything the marker doesn't reach.
     */
    dirty?: boolean;
}
/**
 * The marker for a field whose value differs from the server-side value: a small dot
 * after the label.
 *
 * @remarks The other obvious markers are taken. An asterisk means required, and tinting
 * the input reads as a state it isn't — yellow is a warning, red an error, blue the
 * focus ring. A dot sits beside the label instead of colouring the control, so it stacks
 * with all three.
 *
 * Restyle or remove it for the whole application through the `CcFieldState` theme slot,
 * which every control wrapped in {@link withMuiFieldState} shares:
 *
 * ```ts
 * CcFieldState: { styleOverrides: { root: { "& > .MuiFormLabel-root::after": { display: "none" } } } }
 * ```
 */
export declare const dirtyMarkerStyles: (theme: Theme) => CSSObject;
export type DirtyMarkerClassKey = "root";
export declare const DirtyMarker: React.MemoExoticComponent<() => React.JSX.Element>;
/**
 * Appends {@link DirtyMarker} to a label when the field is modified
 * @param label The label to mark
 * @param dirty Is the field modified?
 */
export declare const labelWithDirtyMarker: (label: React.ReactNode, dirty?: boolean) => React.ReactNode;
export type FieldStateClassKey = "root";
/**
 * Adds this library's field states — {@link MuiFieldStateProps} — to a MUI form component
 *
 * @param Component The component to wrap
 * @remarks MUI covers error, required and disabled; warning and dirty are ours, and both
 * are presentational, so they are applied here rather than in every control. The wrapper
 * swallows both props so neither reaches the DOM, and forwards everything else including
 * the ref, which the date pickers use to anchor their popup.
 *
 * Every wrapped component shares the `CcFieldState` theme slot, which is the one place to
 * restyle or remove either state for a whole application.
 */
export declare const withMuiFieldState: <T extends MuiFieldStateSourceProps>(Component: React.ComponentType<T>) => React.ComponentType<T & MuiFieldStateProps>;
export declare const FormControlCC: React.ComponentType<import("@mui/material").FormControlOwnProps & import("@mui/material/OverridableComponent").CommonProps & Omit<React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>, "className" | "style" | "classes" | "children" | "color" | "sx" | "disabled" | "error" | "margin" | "size" | "variant" | "fullWidth" | "focused" | "hiddenLabel" | "required"> & {
    component?: React.ElementType | undefined;
} & MuiFieldStateProps>;
export declare const FormControlFieldsetCC: React.ComponentType<{
    component: "fieldset";
} & import("@mui/material").FormControlOwnProps & import("@mui/material/OverridableComponent").CommonProps & Omit<React.DetailedHTMLProps<React.FieldsetHTMLAttributes<HTMLFieldSetElement>, HTMLFieldSetElement>, "className" | "style" | "classes" | "children" | "color" | "sx" | "disabled" | "error" | "margin" | "component" | "size" | "variant" | "fullWidth" | "focused" | "hiddenLabel" | "required"> & {
    component?: React.ElementType | undefined;
} & MuiFieldStateProps>;
export declare const FormLabelCC: React.ComponentType<import("@mui/material").FormLabelBaseProps & import("@mui/material").FormLabelOwnProps & import("@mui/material/OverridableComponent").CommonProps & Omit<React.DetailedHTMLProps<React.LabelHTMLAttributes<HTMLLabelElement>, HTMLLabelElement>, keyof import("@mui/material/OverridableComponent").CommonProps | "children" | "color" | "sx" | "form" | "slot" | "title" | "suppressHydrationWarning" | "id" | "lang" | "nonce" | "part" | "role" | "tabIndex" | "aria-activedescendant" | "aria-atomic" | "aria-autocomplete" | "aria-braillelabel" | "aria-brailleroledescription" | "aria-busy" | "aria-checked" | "aria-colcount" | "aria-colindex" | "aria-colindextext" | "aria-colspan" | "aria-controls" | "aria-current" | "aria-describedby" | "aria-description" | "aria-details" | "aria-disabled" | "aria-dropeffect" | "aria-errormessage" | "aria-expanded" | "aria-flowto" | "aria-grabbed" | "aria-haspopup" | "aria-hidden" | "aria-invalid" | "aria-keyshortcuts" | "aria-label" | "aria-labelledby" | "aria-level" | "aria-live" | "aria-modal" | "aria-multiline" | "aria-multiselectable" | "aria-orientation" | "aria-owns" | "aria-placeholder" | "aria-posinset" | "aria-pressed" | "aria-readonly" | "aria-relevant" | "aria-required" | "aria-roledescription" | "aria-rowcount" | "aria-rowindex" | "aria-rowindextext" | "aria-rowspan" | "aria-selected" | "aria-setsize" | "aria-sort" | "aria-valuemax" | "aria-valuemin" | "aria-valuenow" | "aria-valuetext" | "dangerouslySetInnerHTML" | "onCopy" | "onCopyCapture" | "onCut" | "onCutCapture" | "onPaste" | "onPasteCapture" | "onCompositionEnd" | "onCompositionEndCapture" | "onCompositionStart" | "onCompositionStartCapture" | "onCompositionUpdate" | "onCompositionUpdateCapture" | "onFocus" | "onFocusCapture" | "onBlur" | "onBlurCapture" | "onChange" | "onChangeCapture" | "onBeforeInput" | "onBeforeInputCapture" | "onInput" | "onInputCapture" | "onReset" | "onResetCapture" | "onSubmit" | "onSubmitCapture" | "onInvalid" | "onInvalidCapture" | "onLoad" | "onLoadCapture" | "onError" | "onErrorCapture" | "onKeyDown" | "onKeyDownCapture" | "onKeyPress" | "onKeyPressCapture" | "onKeyUp" | "onKeyUpCapture" | "onAbort" | "onAbortCapture" | "onCanPlay" | "onCanPlayCapture" | "onCanPlayThrough" | "onCanPlayThroughCapture" | "onDurationChange" | "onDurationChangeCapture" | "onEmptied" | "onEmptiedCapture" | "onEncrypted" | "onEncryptedCapture" | "onEnded" | "onEndedCapture" | "onLoadedData" | "onLoadedDataCapture" | "onLoadedMetadata" | "onLoadedMetadataCapture" | "onLoadStart" | "onLoadStartCapture" | "onPause" | "onPauseCapture" | "onPlay" | "onPlayCapture" | "onPlaying" | "onPlayingCapture" | "onProgress" | "onProgressCapture" | "onRateChange" | "onRateChangeCapture" | "onSeeked" | "onSeekedCapture" | "onSeeking" | "onSeekingCapture" | "onStalled" | "onStalledCapture" | "onSuspend" | "onSuspendCapture" | "onTimeUpdate" | "onTimeUpdateCapture" | "onVolumeChange" | "onVolumeChangeCapture" | "onWaiting" | "onWaitingCapture" | "onAuxClick" | "onAuxClickCapture" | "onClick" | "onClickCapture" | "onContextMenu" | "onContextMenuCapture" | "onDoubleClick" | "onDoubleClickCapture" | "onDrag" | "onDragCapture" | "onDragEnd" | "onDragEndCapture" | "onDragEnter" | "onDragEnterCapture" | "onDragExit" | "onDragExitCapture" | "onDragLeave" | "onDragLeaveCapture" | "onDragOver" | "onDragOverCapture" | "onDragStart" | "onDragStartCapture" | "onDrop" | "onDropCapture" | "onMouseDown" | "onMouseDownCapture" | "onMouseEnter" | "onMouseLeave" | "onMouseMove" | "onMouseMoveCapture" | "onMouseOut" | "onMouseOutCapture" | "onMouseOver" | "onMouseOverCapture" | "onMouseUp" | "onMouseUpCapture" | "onSelect" | "onSelectCapture" | "onTouchCancel" | "onTouchCancelCapture" | "onTouchEnd" | "onTouchEndCapture" | "onTouchMove" | "onTouchMoveCapture" | "onTouchStart" | "onTouchStartCapture" | "onPointerDown" | "onPointerDownCapture" | "onPointerMove" | "onPointerMoveCapture" | "onPointerUp" | "onPointerUpCapture" | "onPointerCancel" | "onPointerCancelCapture" | "onPointerEnter" | "onPointerLeave" | "onPointerOver" | "onPointerOverCapture" | "onPointerOut" | "onPointerOutCapture" | "onGotPointerCapture" | "onGotPointerCaptureCapture" | "onLostPointerCapture" | "onLostPointerCaptureCapture" | "onScroll" | "onScrollCapture" | "onScrollEnd" | "onScrollEndCapture" | "onWheel" | "onWheelCapture" | "onAnimationStart" | "onAnimationStartCapture" | "onAnimationEnd" | "onAnimationEndCapture" | "onAnimationIteration" | "onAnimationIterationCapture" | "onToggle" | "onBeforeToggle" | "onTransitionCancel" | "onTransitionCancelCapture" | "onTransitionEnd" | "onTransitionEndCapture" | "onTransitionRun" | "onTransitionRunCapture" | "onTransitionStart" | "onTransitionStartCapture" | "disabled" | "error" | "content" | "translate" | "defaultChecked" | "defaultValue" | "suppressContentEditableWarning" | "accessKey" | "autoCapitalize" | "autoFocus" | "contentEditable" | "contextMenu" | "dir" | "draggable" | "enterKeyHint" | "hidden" | "spellCheck" | "radioGroup" | "about" | "datatype" | "inlist" | "prefix" | "property" | "rel" | "resource" | "rev" | "typeof" | "vocab" | "autoCorrect" | "autoSave" | "itemProp" | "itemScope" | "itemType" | "itemID" | "itemRef" | "results" | "security" | "unselectable" | "popover" | "popoverTargetAction" | "popoverTarget" | "inert" | "inputMode" | "is" | "exportparts" | "filled" | "focused" | "required" | "htmlFor"> & {
    component?: React.ElementType | undefined;
} & MuiFieldStateProps>;
export declare const FormHelperTextCC: React.ComponentType<import("@mui/material").FormHelperTextOwnProps & import("@mui/material/OverridableComponent").CommonProps & Omit<React.DetailedHTMLProps<React.HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement>, "className" | "style" | "classes" | "children" | "sx" | "disabled" | "error" | "margin" | "variant" | "filled" | "focused" | "required"> & {
    component?: React.ElementType | undefined;
} & MuiFieldStateProps>;
export declare const TextFieldCC: React.ComponentType<TextFieldProps & MuiFieldStateProps>;

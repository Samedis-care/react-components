import React from "react";
export interface UseImageZoomPanResult {
    /**
     * Callback ref to attach to the zoomable image element
     */
    imgRef: (node: HTMLImageElement | null) => void;
    /**
     * Callback ref to attach to the container element (used for pan clamping and wheel listener)
     */
    containerRef: (node: HTMLDivElement | null) => void;
    /**
     * Container event handlers — spread onto the zoom container element
     */
    containerProps: {
        onPointerDown: React.PointerEventHandler;
        onPointerMove: React.PointerEventHandler;
        onPointerUp: React.PointerEventHandler;
        onPointerLeave: React.PointerEventHandler;
        onTouchStart: React.TouchEventHandler;
        onTouchMove: React.TouchEventHandler;
        onTouchEnd: React.TouchEventHandler;
        onDoubleClick: React.MouseEventHandler;
    };
    /**
     * Turns the image a quarter turn counterclockwise
     */
    rotateLeft: () => void;
    /**
     * Turns the image a quarter turn clockwise
     */
    rotateRight: () => void;
    /**
     * Zooms in one step (by 1.5, up to 10×), keeping the centre of the view in view
     */
    zoomIn: () => void;
    /**
     * Zooms out one step (by 1.5, down to 1×), keeping the centre of the view in view
     * as far as the image still covers it
     */
    zoomOut: () => void;
    /**
     * Goes back to 1×, the whole image in view and centred. Keeps the rotation.
     */
    resetZoom: () => void;
    /**
     * Whether the image is zoomed in (above 1×), so that dragging pans it. Changes only when
     * the image goes from fitted to zoomed in and back, not on every zoom step.
     */
    zoomed: boolean;
    /**
     * Keyboard handler for the element that holds the focus while the view is open, e.g. the
     * dialog: `+` (or `=`) zooms in, `-` zooms out, `0` resets the zoom, and while zoomed in
     * the arrow keys pan by a tenth of the view. Calls `preventDefault()` on the keys it
     * handles; leaves the arrow keys alone at 1×, and every key pressed with Ctrl, Alt or
     * Meta (the browser's own zoom).
     */
    handleKeyDown: React.KeyboardEventHandler;
}
/**
 * Hook providing zoom (mouse wheel / pinch / keys / buttons), pan (drag / arrow
 * keys) and rotation (quarter turns) for an image element inside a container.
 * Updates are imperative (ref-based) so no React re-renders occur during
 * interaction; only `zoomed` re-renders, when the image goes from fitted to
 * zoomed in and back.
 *
 * At zoom 1x, single-finger touch and single-pointer drag events are not
 * intercepted, allowing parent scroll-based interactions (e.g. swipe
 * navigation) to work normally. Pinch gestures and mouse wheel zoom always
 * work regardless of zoom level.
 *
 * Keyboard and buttons: attach `handleKeyDown` to the element that holds the
 * focus (the dialog), and offer `zoomIn`, `zoomOut` and `resetZoom` as buttons,
 * so the view can be zoomed and panned without a pointer.
 *
 * A turned image is scaled to fit its box again, so the image is expected to
 * fill its box with `object-fit: contain`.
 *
 * @param open Whether the zoomable view is currently active. Resets zoom, pan and rotation when transitioning to true.
 * @param src The image shown. Resets zoom, pan and rotation when it changes while open, so the next image starts unzoomed and upright.
 */
declare const useImageZoomPan: (open: boolean, src?: string) => UseImageZoomPanResult;
export default useImageZoomPan;

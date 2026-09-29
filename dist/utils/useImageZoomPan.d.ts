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
}
/**
 * Hook providing zoom (mouse wheel / pinch), pan (drag) and rotation (quarter
 * turns) for an image element inside a container. Updates are imperative
 * (ref-based) so no React re-renders occur during interaction.
 *
 * At zoom 1x, single-finger touch and single-pointer drag events are not
 * intercepted, allowing parent scroll-based interactions (e.g. swipe
 * navigation) to work normally. Pinch gestures and mouse wheel zoom always
 * work regardless of zoom level.
 *
 * A turned image is scaled to fit its box again, so the image is expected to
 * fill its box with `object-fit: contain`.
 *
 * @param open Whether the zoomable view is currently active. Resets zoom, pan and rotation when transitioning to true.
 * @param src The image shown. Resets zoom, pan and rotation when it changes while open, so the next image starts unzoomed and upright.
 */
declare const useImageZoomPan: (open: boolean, src?: string) => UseImageZoomPanResult;
export default useImageZoomPan;
